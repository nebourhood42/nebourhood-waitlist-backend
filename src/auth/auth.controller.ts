import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GoogleSigninDto, GoogleSignupDto } from './dto/create-auth.dto';



@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/signup')
  @ApiOperation({
    summary: 'Google Signup',
    description:
      'Creates a new account using Google authentication token. If the email already exists without Google linked, it links the account.',
  })
  @ApiBody({
    type: GoogleSignupDto,
    examples: {
      example1: {
        summary: 'Signup Example',
        value: {
          token: 'google-id-token',
          referral_code: 'abc123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        access_token: 'jwt-token',
        user: {
          userID: 'a4d2f1',
          email: 'user@gmail.com',
          sub: '689fksdf89sd',
          expires_at: 1770000000000,
        },
        message: 'login successful',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid referral code',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid Google token',
  })
  @ApiResponse({
    status: 409,
    description: 'Account already exists',
  })
  async googleSignup(@Body() body: GoogleSignupDto) {
    return this.authService.googleSignup(body.token, body.referral_code)
  }




  @Post('google/signin')
  @ApiOperation({
    summary: 'Google Signin',
    description: 'Login using Google authentication token',
  })
  @ApiBody({
    type: GoogleSigninDto,
    examples: {
      example1: {
        summary: 'Signin Example',
        value: {
          token: 'google-id-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        access_token: 'jwt-token',
        user: {
          userID: 'a4d2f1',
          email: 'user@gmail.com',
          sub: '689fksdf89sd',
          expires_at: 1770000000000,
        },
        message: 'login successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Invalid Google token or Google account not linked',
  })
  async googleLogin(@Body() body: GoogleSigninDto) {
    return this.authService.googleLogin(body.token)
  }
}
