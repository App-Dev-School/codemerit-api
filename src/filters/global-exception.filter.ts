
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CannotCreateEntityIdMapError, EntityNotFoundError, QueryFailedError } from 'typeorm';


export class GlobalExceptionFilter implements ExceptionFilter {
    // constructor(private readonly logger : Logger){
    // }
   
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let message = (exception as any).message.message;
        let code = 'HttpException';

        Logger.error(message, (exception as any).stack, `${request.method} ${request.url}`);

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        
        switch (exception.constructor) {
            case HttpException:
                status = (exception as HttpException).getStatus();
                message = "Some error occured! "+JSON.stringify(exception);
                break;
            case BadRequestException:  // this is a TypeOrm error
                status = HttpStatus.BAD_REQUEST
                message = (exception as BadRequestException).message;
                code = (exception as any).code;
                break;    
            case QueryFailedError:  // this is a TypeOrm error
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as QueryFailedError).message;
                code = (exception as any).code;
                break;
            case EntityNotFoundError:  // this is another TypeOrm error
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as EntityNotFoundError).message;
                code = (exception as any).code;
                break;
            case CannotCreateEntityIdMapError: // and another
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as CannotCreateEntityIdMapError).message;
                code = (exception as any).code;
                break;
            //skilltest003 work here
            case UnauthorizedException: // and another
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as UnauthorizedException).message;
                code = (exception as any).code;
                break;
            default:
                status = HttpStatus.INTERNAL_SERVER_ERROR
        }
        Logger.log("{{{ #SkillTest ExceptionFilter -> }}}}"+JSON.stringify(GlobalResponseError(status, message, code, request)));
        response.status(status).json(GlobalResponseError(status, message, code, request));
    }
}


export const GlobalResponseError: (statusCode: number, message: string, code: string, request: Request) => IResponseError = (
    statusCode: number,
    message: string,
    code: string,
    request: Request
): IResponseError => {
    return {
        error: (statusCode >= 200 && statusCode <= 299) ? false : true,
        message,
        code,
        timestamp: new Date().toISOString(),
        tag: "GlobalResponseError"
    };
};


export interface IResponseError {
    error: boolean;
    message: string;
    code: string;
    timestamp: string;
    tag?: string;
}