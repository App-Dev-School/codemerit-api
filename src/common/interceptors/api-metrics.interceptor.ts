import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { metricsAsyncStorage } from '../metrics/metrics-async-storage';

const METRICS_ENABLED = true;

@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return metricsAsyncStorage.run({ queryCount: 0 }, () => {
      return next.handle().pipe(
        map((data) => {
          const durationMs = Date.now() - now;
          const store = metricsAsyncStorage.getStore();
          const queryCount = store ? store.queryCount : undefined;
          if (METRICS_ENABLED) {
            if (typeof data === 'object' && data !== null) {
              data.metrics = { durationMs, queryCount };
            }
          }
          // Always log performance
          const req = context.switchToHttp().getRequest();
          const method = req.method;
          const url = req.originalUrl || req.url;
          console.log(`[API METRICS] ${method} ${url} - ${durationMs}ms, queries: ${queryCount}`);
          return data;
        })
      );
    });
  }
}
