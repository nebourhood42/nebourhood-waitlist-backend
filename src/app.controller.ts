import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Returns a simple message to verify the API is running.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is running successfully',
    schema: {
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
