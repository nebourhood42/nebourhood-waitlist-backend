import { ApiProperty } from '@nestjs/swagger';
export class CreateProfileDto {}

export class ProfileResponseDto {
  @ApiProperty({
    example: 'a4d2f1',
  })
  userId!: string;

  @ApiProperty({
    example: 'john@gmail.com',
  })
  email!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  fullName!: string;

  @ApiProperty({
    example: 'https://example.com/profile.png',
  })
  profileImage!: string;

  @ApiProperty({
    example: 'a4d2f1',
  })
  referral_code!: string;

  @ApiProperty({
    example: 'abc123',
    nullable: true,
  })
  referredBy?: string;

  @ApiProperty({
    example: 5,
  })
  referral_count!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}