import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';


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

export class OnboardingDto {
  @IsArray()
  @IsString({ each: true })
  crafts!: string[];

  @IsInt()
  @Min(0)
  @Max(50)
  yearsOfExperience!: number;

  @IsArray()
  @IsString({ each: true })
  goals!: string[];
}