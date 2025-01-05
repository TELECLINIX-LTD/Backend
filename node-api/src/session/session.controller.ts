import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionDto } from './dtos/session.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
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
  async getUserSessions(@Param('userId') userId: string, @Request() req: any) {
    console.log(req.user, 'na me be the user o');
    return await this.sessionService.getUserSessions(userId);
  }
}
