import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : (payload as { message?: string | string[] }).message ?? 'Error';
      const method = request.method;
      const path = request.url;
      const normalizedMessage = Array.isArray(message) ? message.join('; ') : message;
      const logLine = `${method} ${path} -> ${status} ${normalizedMessage}`;
      if (status >= 500) {
        this.logger.error(logLine);
      } else {
        this.logger.warn(logLine);
      }

      response.status(status).json({
        statusCode: status,
        path: request.url,
        message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const method = request.method;
    const path = request.url;
    if (exception instanceof Error) {
      this.logger.error(`${method} ${path} -> 500 ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`${method} ${path} -> 500 Unknown error`);
    }
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: request.url,
      message: 'Error interno del servidor.',
      timestamp: new Date().toISOString(),
    });
  }
}
