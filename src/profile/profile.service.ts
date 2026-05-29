import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  async getUserProfileByUserId(userId: string) {
    const existingUser = await this.userModel.findOne({ userId })
    if (!existingUser) throw new NotFoundException('User not Found');
    return { ...existingUser.toObject(), googleId: undefined, __v: undefined, _id: undefined }
  }

  async getUserProfile(email: string) {
    const existingUser = await this.userModel.findOne({ email })
    if (!existingUser) throw new NotFoundException('User not Found');
    return { ...existingUser.toObject(), googleId: undefined, __v: undefined, _id: undefined }
  }
}
