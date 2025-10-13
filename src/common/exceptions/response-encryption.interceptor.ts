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
                // console.log('calling ResponseEncryptionInterceptor### 01', data);

                const encrypted = this.cryptoService.encrypt(JSON.stringify(data));
                // console.log('calling ResponseEncryptionInterceptor### 02', encrypted);
                return { payload: encrypted }; // Wrap it in a "payload"
            }),
        );
    }
}
