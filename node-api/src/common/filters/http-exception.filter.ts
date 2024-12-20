import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CombinedLogger } from '../logger/combined.logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CombinedLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url, ip } = request;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse =
      exception instanceof HttpException
        ? {
            statusCode: status,
            message:
              (exception.getResponse() as any)?.message ||
              exception.message ||
              'An error occurred',
            error: (exception.getResponse() as any)?.error || 'HttpException',
            // Optional: Include details of the error if available
            ...((exception.getResponse() as any)?.details && {
              details: (exception.getResponse() as any)?.details,
            }),
            // Optionally include the stack trace for development (don't expose in production)
            stack:
              process.env.NODE_ENV === 'development'
                ? exception.stack
                : undefined,
          }
        : {
            statusCode: status,
            message:
              exception instanceof Error
                ? exception.message
                : 'Internal server error',
            error: exception instanceof Error ? exception.name : 'UnknownError',
            // Optionally include the stack trace for development (don't expose in production)
            stack:
              process.env.NODE_ENV === 'development' &&
              exception instanceof Error
                ? exception.stack
                : undefined,
          };

    // Log detailed error information using WinstonLogger
    this.logger.error(
      `${method} ${url} - ${status} - ${ip}ms\nResponse: ${JSON.stringify(
        errorResponse,
      )}`,

      (exception as any).stack || '',
      HttpExceptionFilter.name,
    );

    response.status(status).json({
      statusCode: status,
      ...errorResponse, // why do I have to put ... here? What does it do? it
      timestamp: new Date().toISOString(),
      path: url,
    });
  }
}
