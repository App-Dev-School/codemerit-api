import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// @Injectable()
// export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     return next.handle().pipe(
//       map((data) => ({
//         error: false,
//         result_code: 200,
//         message: 'Success',
//         values: data,
//       })),
//     );
//   }
// }

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const message = response?.message || 'Success';
        const values = response?.data !== undefined ? response.data : response;

        return {
          error: false,
          result_code: 200,
          message,
          values,
        };
      }),
    );
  }
}
