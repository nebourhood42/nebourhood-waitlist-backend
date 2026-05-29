import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
// import { CreateProfileDto } from './dto/create-profile.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/common/strategies/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileResponseDto } from './dto/create-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({
    summary: 'Get authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(@Req() req) {
    return this.profileService.getUserProfile(req.user.email)
  }

  
  @Get(':id')
  @ApiOperation({
    summary: 'Get profile by userId',
  })
  @ApiParam({
    name: 'id',
    example: 'a4d2f1',
    description: 'User unique ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfileByUserId(@Param('id') id: string) {
    return this.profileService.getUserProfileByUserId(id)
  }
}
