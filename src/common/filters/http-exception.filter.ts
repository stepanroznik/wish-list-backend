import {
    Catch,
    ArgumentsHost,
    HttpException,
    Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
    constructor(private readonly logger: LoggerService) {
        super();
        this.logger.setContext(HttpExceptionFilter.name);
    }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const statusCode = exception.getStatus();
        const message = exception.message;
        const stack = exception.stack;

        if (statusCode >= 400) {
            this.logger.warn(`HTTP Exception (${statusCode})`, {
                message,
                path: request.url,
                stack,
            });
        }

        super.catch(exception, host);
    }
}
