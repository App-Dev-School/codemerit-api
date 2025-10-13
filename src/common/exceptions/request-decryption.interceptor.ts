// src/common/interceptors/request-decryption.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CryptoService } from '../utils/crypto.service';

@Injectable()
export class RequestDecryptionInterceptor implements NestInterceptor {
    constructor(private readonly cryptoService: CryptoService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        try {
            const encryptedPayload = request.body?.payload;

            if (!encryptedPayload || typeof encryptedPayload !== 'string') {
                throw new BadRequestException('Missing or invalid encrypted payload');
            }

            const decryptedString = this.cryptoService.decrypt(encryptedPayload);
            request.body = JSON.parse(decryptedString); // replace the request body
        } catch (error) {
            throw new BadRequestException('Invalid encrypted request body: ' + error.message);
        }

        return next.handle();
    }
}
