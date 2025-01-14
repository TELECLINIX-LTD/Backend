import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogOutDto, QuerySessionDto, SessionDto } from './dtos/session.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SessionService {
  constructor(
    private db: PrismaService,
    private readonly redisService: RedisService,
  ) {}

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

  async getUserSessions(userId: string, querySessionDto: QuerySessionDto) {
    const { sort, limit, page, sortBy } = querySessionDto;
    const skip = (page - 1) * limit;

    //Generate a Redis cache key
    const cacheKey = `sessions:user:${userId}:page:${page}:limit:${limit}:sort:${sort}:sortBy:${sortBy}`;

    //check if the cache exists
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      console.log('Data fetched from cache');
      return JSON.parse(cachedData);
    }

    const take = limit || 8;

    const sessions = await this.db.session.findMany({
      where: { userId },
      orderBy: { [sortBy]: sort },
      skip,
      take,
    });

    console.log('Data fetched from database', sessions);

    if (!sessions || sessions.length === 0) {
      throw new Error('User not found or no sessions found');
    }

    const totalSessions = await this.db.session.count({ where: { userId } });
    const totalPages = Math.ceil(totalSessions / limit);
    const metaData = {
      page,
      limit,
      totalSessions,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    const response = {
      message: 'Sessions retrieved successfully',
      data: sessions,
      metaData,
    };

    //set cache
    await this.redisService.set(cacheKey, JSON.stringify(response), 172800);

    return response;
  }

  async logOut(logOutDto: LogOutDto) {
    const { sessionId } = logOutDto;

    await this.db.session.update({
      where: { id: sessionId },
      data: {
        logoutTime: new Date(),
      },
    });

    return { message: 'Session ended successfully.' };
  }
}
