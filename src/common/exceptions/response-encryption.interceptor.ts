// src/common/interceptors/response-encryption.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { CryptoService } from '../utils/crypto.service';

@Injectable()
export class ResponseEncryptionInterceptor implements NestInterceptor {
    constructor(private readonly cryptoService: CryptoService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // Encrypt the response
                const encrypted = this.cryptoService.encrypt(JSON.stringify(data));
                return { payload: encrypted }; // Wrap it in a "payload"
            }),
        );
    }
}
