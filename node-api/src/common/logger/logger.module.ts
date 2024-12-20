import { Global, Module } from '@nestjs/common';
import { CombinedLogger } from './combined.logger';
import { WinstonLogger } from './winston.logger';

@Global()
@Module({
  providers: [WinstonLogger, CombinedLogger],
  exports: [CombinedLogger],
})
export class LoggerModule {}
