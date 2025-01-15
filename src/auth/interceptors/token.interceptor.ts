import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
  } from '@nestjs/common';
  import type { Response } from 'express';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  import { AuthService } from '../auth.service';
import { User } from 'src/typeorm/entities/user.entity';
  
  @Injectable()
  export class TokenInterceptor implements NestInterceptor {
    constructor(private readonly authService: AuthService) {}
  
    intercept(
      context: ExecutionContext,
      next: CallHandler<User>,
    ): Observable<User> {
      return next.handle().pipe(
        map(user => {
          console.log("Cool 1", JSON.stringify(user));
          
          const response = context.switchToHttp().getResponse<Response>();
          const token = this.authService.signToken(user['userDetails']);
          console.log("##token## =>", JSON.stringify(token));
          Logger.log("##token## => "+JSON.stringify(token));
          response.setHeader('Authorization', `Bearer ${token}`);
          // response.cookie('token', token, {
          //   httpOnly: true,
          //   signed: true,
          //   sameSite: 'strict',
          //   secure: process.env.NODE_ENV === 'production',
          // });
          return user;
        }),
      );
    }
  }