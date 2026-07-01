import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { ONBOARDING_CRAFTS_LIST, ONBOARDING_GOALS_lIST } from 'src/common/constant/documents.contant';


@Schema({ timestamps: true })
export class UserCraft {

  @Prop({ type: String, required: true, unique: true, ref: 'User' })
  userId!: string

  @Prop({
      type: [String],
      enum: ONBOARDING_CRAFTS_LIST,
      default: [],
   })
   crafts!: string[];

   @Prop({ type: Number, default: 0 })
   yearsOfExperience!: number;

   @Prop({
      type: [String],
      enum: ONBOARDING_GOALS_lIST.map(g => g.id),
      default: [],
   })
   goals!: string[];
}


export const UserSchema = SchemaFactory.createForClass(UserCraft);