import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async onModuleInit() {
    this.logger.log('Redis client connected');
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: string, ttl: number = 600): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, JSON.stringify(value));
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
