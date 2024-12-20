import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLogger implements LoggerService {
  private readonly logger: Logger;
  private context: string = 'Application';

  constructor() {
    this.logger = createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        format.printf(
          ({
            timestamp,
            level,
            message,
            context,
            stack,
            clientInfo,
            requestInfo,
          }) => {
            const pid = process.pid;
            const logContext = context || this.context;
            const baseMessage = `[Nest] ${pid} - ${timestamp} ${level.toUpperCase()} [${logContext}] ${message}`;
            const clientMessage = clientInfo ? `Client: ${clientInfo}` : '';
            const requestMessage = requestInfo ? `Request: ${requestInfo}` : '';
            const detailedMessage = stack
              ? `${baseMessage}\n${clientMessage}\n${requestMessage}\nStack Trace:\n${stack}`
              : `${baseMessage}\n${clientMessage}\n${requestMessage}`;
            return detailedMessage.trim();
          },
        ),
      ),
      transports: [
        // new transports.Console({
        //   format: format.combine(
        //     format.colorize(),
        //     format.printf(({ timestamp, level, message, context, ms }) => {
        //       const pid = process.pid;
        //       return `[Nest] ${pid}  - ${timestamp}     ${level.toUpperCase()} [${context || this.context}] ${message} ${ms || ''}`;
        //     }),
        //   ),
        // }),
        new transports.File({
          level: 'error',
          filename: 'logs/error.log',
          format: format.combine(
            format.uncolorize(), // Remove colors from file logs
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json(), // JSON format for easy parsing
            format.printf(({ timestamp, level, message, context, stack }) => {
              const pid = process.pid;
              const logContext = context || this.context;
              const baseMessage = `[Nest] ${pid}  - ${timestamp}     ${level.toUpperCase()} [${logContext}] ${message}`;
              return stack ? `${baseMessage}\n${stack}` : baseMessage;
            }),
          ),
        }),
        new transports.File({
          filename: 'logs/combined.log',
          level: 'info',
          format: format.combine(
            format.uncolorize(), // Remove colors from file logs
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json(), // Log in JSON format for better structure
          ),
        }),
      ],
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      stack: trace,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }
}
