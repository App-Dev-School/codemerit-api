import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiUsageService } from 'src/common/services/api-usage.service';

@Injectable()
export class ApiUsageInterceptor implements NestInterceptor {
  constructor(private readonly apiUsageService: ApiUsageService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const rawUserId = req?.user?.id ?? req?.user?.sub;
    const userId = Number(rawUserId);

    if (!Number.isFinite(userId) || userId <= 0) {
      return next.handle();
    }

    res.on('finish', () => {
      void this.apiUsageService.track(userId);
    });

    return next.handle();
  }
}
