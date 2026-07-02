import { BadRequestException, ConflictException, Injectable, NotFoundException, RequestTimeoutException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { configDotenv } from 'dotenv';
import { GithubProfileDto, OnboardingDto } from './dto/create-auth.dto';
import { UserCraft, UserCraftDocument } from './schemas/onboarding.schema';
import { ONBOARDING_CRAFTS_LIST, ONBOARDING_GOALS_lIST } from 'src/common/constant/documents.contant';
configDotenv()


export function generateUserID(): string {
  return crypto.randomBytes(3).toString('hex'); // 6-char code like 'a4d2f1'
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserCraft.name) private userCraftModel: Model<UserCraftDocument>,
    private jwtService: JwtService,
    private googleClient: OAuth2Client
  ) { }

  private async generateUniqueUserID(): Promise<string> {
    let userID: string;
    let exists = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (exists && attempts < MAX_ATTEMPTS) {
      userID = generateUserID();
      const user = await this.userModel.findOne({ userID });
      exists = !!user;
      attempts++;
    }

    if (exists) throw new RequestTimeoutException('Failed to generate unique userID after multiple attempts');

    return userID!;
  }

  private async handleReferrer(referral_code?: string) {
    if (!referral_code) return undefined;

    const referrer = await this.userModel.findOne({ referral_code });
    if (!referrer) throw new BadRequestException('Invalid referral code');

    await this.userModel.findByIdAndUpdate(referrer._id, {
      $inc: { referral_count: 1 },
    });

    return referrer.referral_code;
  }

  private generateJwt(user: UserDocument) {
    const payload = { userId: user.userId, email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }

  private formatAuthResponse(user: UserDocument, message = 'login successful') {
    return {
      success: true,
      access_token: this.generateJwt(user),
      user: {
        userID: user.userId,
        email: user.email,
        sub: user._id,
        expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      },
      message,
    };
  }

  private formatGenericResponse(data: any, message: string = 'Operation Successful', success: boolean = true) {
    return {
      success,
      data,
      message,
    }
  }

  private async verifyGoogleToken(token: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  }


  //Google service functionalities
  //start

  async googleLogin(token: string) {
    const ticket = await this.verifyGoogleToken(token);
    if (!ticket) throw new UnauthorizedException('Invalid Google token');

    const { sub } = ticket;
    const user = await this.userModel.findOne({ sub: sub });

    if (!user) {
      throw new UnauthorizedException(
        'Google account not linked. Please sign up first.',
      );
    }

    return this.formatAuthResponse(user);
  }


  async googleSignup(token: string, referral_code?: string) {
    const ticket = await this.verifyGoogleToken(token);
    if (!ticket) throw new UnauthorizedException('Invalid Google token');

    const { email, sub, picture, name } = ticket;

    // Find existing user by email
    let user = await this.userModel.findOne({ email });

    // If already linked to this Google → conflict
    if (user?.sub && user.sub === sub) {
      throw new ConflictException('Account already exists. Please login.');
    }

    // If email linked to another Google account → block
    if (user?.sub && user.sub !== sub) {
      throw new UnauthorizedException(
        'Email already linked to another Google account',
      );
    }

    // Link existing user without sub
    if (user && !user.sub) {
      user.sub = sub;
      user.profileImage = picture ?? user.profileImage;
      await user.save();
    }

    // Create new user if none exists
    if (!user) {
      const userId = await this.generateUniqueUserID();
      const referredBy = await this.handleReferrer(referral_code);

      user = new this.userModel({
        userId,
        email,
        sub: sub,
        authProvider: 'google',
        profileImage: picture,
        fullName: name,
        referral_code: userId,
        referredBy,
      });

      await user.save();

      // if (referral_code) {
      //   await this.crewService.updateCrew(referral_code, user);
      // }
    }

    return this.formatAuthResponse(user);
  }

  //end

  // Github Service functionalities
  //start
  async githubAuth(profile: GithubProfileDto, referral_code?: string) {
    const { email, fullName, profileImage, sub } = profile;

    if (!email) {
      throw new BadRequestException('Account has no email');
    }

    // Find existing user by email
    let user = await this.userModel.findOne({ email, sub });

    if (!user) {
      const userId = await this.generateUniqueUserID();
      const referredBy = await this.handleReferrer(referral_code);

      user = new this.userModel({
        userId,
        email,
        sub,
        authProvider: 'github',
        profileImage,
        fullName,
        referral_code: userId,
        referredBy,
      });

      await user.save();
    }

    return this.formatAuthResponse(user);
  }


  async updateOnboardingDetails(userId: string, updates: OnboardingDto) {
    const existingUser = await this.userModel.findOne({ userId: userId });

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    const { crafts, yearsOfExperience, goals } = updates;

    // Validate crafts
    if (crafts) {
      const invalidCrafts = crafts.filter(
        (craft) => !ONBOARDING_CRAFTS_LIST.includes(
          craft as typeof ONBOARDING_CRAFTS_LIST[number],
        ),
      );

      if (invalidCrafts.length > 0) {
        throw new BadRequestException({
          message: 'Invalid craft(s) selected.',
          invalidCrafts,
        });
      }
    }

    // Validate goals
    if (goals) {
      const validGoalIds = ONBOARDING_GOALS_lIST.map((goal) => goal.id);

      const invalidGoals = goals.filter(
        (goal) => !validGoalIds.includes(
          goal as typeof ONBOARDING_GOALS_lIST[number]['id']
        ),
      );

      if (invalidGoals.length > 0) {
        throw new BadRequestException({
          message: 'Invalid goal(s) selected.',
          invalidGoals,
        });
      }
    }

    // Create or update onboarding
    const onboarding = await this.userCraftModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(crafts !== undefined && { crafts }),
          ...(yearsOfExperience !== undefined && {
            yearsOfExperience,
          }),
          ...(goals !== undefined && { goals }),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    // Update onboarding status
    if (
      existingUser.onboardingStatus !== OnboardingStatusEnum.COMPLETED
    ) {
      existingUser.onboardingStatus =
        OnboardingStatusEnum.COMPLETED;

      await existingUser.save();
    }

    return this.formatGenericResponse(onboarding, 'Onboarding details updated successfully');
  }


}
