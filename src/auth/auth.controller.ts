import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/signup')
  async googleSignup(@Body('token') token: string, @Body('referral_code') referral_code: string) {
    return this.authService.googleSignup(token, referral_code)
  }
  @Post('google/signin')
  async googleLogin(@Body('token') token: string) {
    return this.authService.googleLogin(token)
  }
}
