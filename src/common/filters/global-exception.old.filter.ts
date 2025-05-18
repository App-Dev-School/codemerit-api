import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  RequestTimeoutException,
  ConflictException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from 'src/common/services/logger.service';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';

export class GlobalExceptionOldFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let message = (exception as any).message.message;
    Logger.log(
      'GlobalExceptionFilter #1 exception => ' + JSON.stringify(exception),
    );
    Logger.log(
      'GlobalExceptionFilter #2 exceptionType => ' + exception.constructor,
    );
    let code = 'HttpException';
    this.logger.log(`GlobalExceptionFilter #3 message: ${message}`);
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    //code = (exception as any).code;
    switch (exception.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
        if (!message) {
          message = (exception as HttpException).getResponse();
        }
        break;
      case BadRequestException: // this is a TypeOrm error
        status = HttpStatus.BAD_REQUEST;
        if (!message)
          message = (exception as BadRequestException).getResponse();
        break;
      case QueryFailedError: // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        if (!message) message = (exception as QueryFailedError).message;
        break;
      case EntityNotFoundError: // this is another TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        if (!message) message = (exception as EntityNotFoundError).message;
        break;
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        if (!message)
          message = (exception as CannotCreateEntityIdMapError).message;
        break;
      case UnauthorizedException: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        if (!message) message = 'User Unauthorized';
        break;
      case RequestTimeoutException: // and another
        status = HttpStatus.REQUEST_TIMEOUT;
        if (!message) message = (exception as RequestTimeoutException).message;
        break;
      case ConflictException: // and another
        status = HttpStatus.CONFLICT;
        if (!message) message = (exception as ConflictException).message;
        break;
      case TypeORMError: // and another
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error processing query for this request.';
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    //Logger.log("{{{ #SkillTest ExceptionFilter -> }}}}"+JSON.stringify(GlobalResponseError(status, message, code, request)));
    response
      .status(status)
      .json(GlobalResponseError(status, message, code, request));
  }
}

export const GlobalResponseError: (
  statusCode: number,
  message: string,
  code: string,
  request: Request,
) => IResponseError = (
  statusCode: number,
  message: string,
  code: string,
  request: Request,
): IResponseError => {
  return {
    error: statusCode >= 200 && statusCode <= 299 ? false : true,
    message,
    code,
    timestamp: new Date().toISOString(),
    tag: 'GlobalResponseError',
  };
};

export interface IResponseError {
  error: boolean;
  message: string;
  code: string;
  timestamp: string;
  tag?: string;
}
