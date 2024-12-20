import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';
import { WinstonLogger } from './winston.logger';

@Injectable()
export class CombinedLogger extends ConsoleLogger implements LoggerService {
  constructor(private readonly winstonLogger: WinstonLogger) {
    super();
  }
  log(message: string, context?: string) {
    this.winstonLogger.log(message, context);
    super.log(message, context);
  }

  error(message: string, trace: string, context?: string) {
    this.winstonLogger.error(message, trace, context);
    super.error(message, '', context);
  }

  warn(message: string, context?: string) {
    this.winstonLogger.warn(message, context);
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.winstonLogger.debug(message, context);
    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.winstonLogger.verbose(message, context);
    super.verbose(message, context);
  }
}
