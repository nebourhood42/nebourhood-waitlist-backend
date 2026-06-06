import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';


@Schema({ timestamps: true })
export class SocialTracer {
  @Prop({ type: String, required: true, unique: true })
  userId!: string

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: String, required: true })
  telegram_profile_link!: string

  @Prop({ type: String, required: true })
  hear_about_us!: string
}

export const SocialTracerrSchema = SchemaFactory.createForClass(SocialTracer);