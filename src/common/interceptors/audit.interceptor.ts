import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const userId = request.user?.id;
    if (userId && request.body) {
      switch (method) {
        case 'POST':
          request.body.createdBy = userId;
          break;
        case 'PUT':
        case 'PATCH':
          request.body.updatedBy = userId;
          break;
      }
    }

    return next.handle();
  }
}
