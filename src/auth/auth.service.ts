import { BadRequestException, ConflictException, Injectable, RequestTimeoutException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';


export function generateUserID(): string {
  return crypto.randomBytes(3).toString('hex'); // 6-char code like 'a4d2f1'
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
    const user = await this.userModel.findOne({ googleId: sub });

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
    if (user?.googleId && user.googleId === sub) {
      throw new ConflictException('Account already exists. Please login.');
    }

    // If email linked to another Google account → block
    if (user?.googleId && user.googleId !== sub) {
      throw new UnauthorizedException(
        'Email already linked to another Google account',
      );
    }

    // Link existing user without googleId
    if (user && !user.googleId) {
      user.googleId = sub;
      user.profileImage = picture ?? user.profileImage;
      await user.save();
    }

    // Create new user if none exists
    if (!user) {
      const userID = await this.generateUniqueUserID();
      const referredBy = await this.handleReferrer(referral_code);

      user = new this.userModel({
        userID,
        email,
        googleId: sub,
        profileImage: picture,
        fullName: name,
        referral_code: userID,
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
}
