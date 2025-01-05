import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionDto } from './dtos/session.dto';

@Injectable()
export class SessionService {
  constructor(private db: PrismaService) {}

  async logSession(logSessionDto: SessionDto) {
    const { userId, deviceInfo, ipAddress } = logSessionDto;
    return this.db.session.create({
      data: {
        userId,
        deviceInfo,
        ipAddress,
      },
    });
  }

  async getUserSessions(userId: string) {
    const user = await this.db.session.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' },
    });
    if (!user || user.length === 0) {
      throw new Error('User not found or no sessions found');
    }
    return {
      message: 'Sessions retrieved successfully',
      data: user,
    };
  }
}
