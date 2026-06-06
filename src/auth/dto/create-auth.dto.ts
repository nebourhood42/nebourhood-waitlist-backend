import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class CreateAuthDto {}

export class GoogleSignupDto {
  @ApiProperty({
    example: 'google-id-token',
    description: 'Google OAuth ID token',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiPropertyOptional({
    example: 'abc123',
    description: 'Referral code',
  })
  @IsString()
  @IsOptional()
  referral_code?: string;
}

export class GoogleSigninDto {
  @ApiProperty({
    example: 'google-id-token',
    description: 'Google OAuth ID token',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class GithubProfileDto {

  @IsString()
  email!: string;

  @IsString()
  fullName!: string;

  @IsString()
  profileImage!: string;

  @IsString()
  sub!: string;
}

export class QuestionnaireDto {
  
}