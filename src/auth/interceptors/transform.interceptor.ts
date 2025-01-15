import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map, tap } from 'rxjs/operators';
  
  export interface IResponseSuccess<T> {
    error: boolean;
    message: string;
    data: T;
  }
  
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<T, IResponseSuccess<T>> {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<IResponseSuccess<T>> {
      const statusCode = context.switchToHttp().getResponse().statusCode;
      const error = (statusCode >= 200 && statusCode <= 299) ? false: true;
      Logger.log("##### TransformInterceptor 1 ####"+ statusCode);
      //Dev only
      const payload = context.switchToHttp().getResponse().payload;
      Logger.log("##### TransformInterceptor 1.2 ##payload##"+ payload);
      return next.handle()
        .pipe(
          map((data) => ({
            error: error,
            message: (data && data.message) ? data.message : "None "+JSON.stringify(data),
            data: data,
            source: "TransformInterceptor"
          }), tap((data) =>{
           Logger.log("##### TransformInterceptor ####"+ JSON.stringify(data));
          })),
        );
    }
  }