import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';


@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  userId!: string

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: String, required: true })
  fullName!: string

  @Prop({ type: String, unique: true, sparse: true })
  googleId!: string;

  @Prop({ type: String, default: '' })
  profileImage!: string;

  @Prop({ required: true })
  referral_code?: string;

  @Prop({ default: null })
  referredBy?: string;

  @Prop({ default: 0 })
  referral_count!: number;

}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.statics.search = function (keyword: string) {
  const pattern = new RegExp(keyword, 'i'); // case-insensitive

  return this.find({
    $or: [
      { userId: pattern },
      { email: pattern },
      { referral_code: pattern },
      { referredBy: pattern },
    ],
  });
};


export interface UserDocument extends User, Document { }

export interface UserModel extends Model<UserDocument> {
  search(keyword: string): Promise<UserDocument[]>;
}