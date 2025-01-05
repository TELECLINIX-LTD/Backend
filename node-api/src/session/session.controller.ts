import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionDto } from './dtos/session.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'Log user session' })
  @ApiBody({ type: SessionDto })
  @ApiResponse({ status: 201, description: 'Session logged successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async logSession(@Body() logSessionDto: SessionDto) {
    return await this.sessionService.logSession(logSessionDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all sessions of a user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserSessions(@Param('userId') userId: string) {
    return await this.sessionService.getUserSessions(userId);
  }
}
