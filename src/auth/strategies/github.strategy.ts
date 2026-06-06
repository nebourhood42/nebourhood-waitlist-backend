import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  'github',
) {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        `${process.env.BACKEND_URL}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
   const fullName = profile._json?.name || profile.username;

   return {
      sub: profile.id,
      email: profile.emails?.[0]?.value || null,
      accessToken,
      profileImage: profile._json?.avatar_url || null,
      fullName
   }
  }
}