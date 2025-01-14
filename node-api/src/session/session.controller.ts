import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { LogOutDto, QuerySessionDto, SessionDto } from './dtos/session.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('log-session')
  @ApiOperation({ summary: 'Log user session' })
  @ApiBody({ type: SessionDto })
  @ApiResponse({ status: 201, description: 'Session logged successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async logSession(@Body() logSessionDto: SessionDto) {
    return await this.sessionService.logSession(logSessionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sessions of a user with pagination and caching',
  })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserSessions(
    @Request() req: any,
    @Query() querySessionDto: QuerySessionDto,
  ) {
    const userId = req?.user?.id;
    return await this.sessionService.getUserSessions(userId, querySessionDto);
  }

  @Post('log-out')
  @ApiOperation({ summary: 'Log out user session' })
  @ApiBody({ type: LogOutDto })
  @ApiResponse({ status: 200, description: 'Session ended successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid session or failed to log out.',
  })
  async logOut(@Body() logOutDto: LogOutDto) {
    return await this.sessionService.logOut(logOutDto);
  }
}
