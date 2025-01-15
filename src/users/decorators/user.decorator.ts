import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/typeorm/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>().user as User;
    Logger.log("##AppLog1 @AuthUser => "+JSON.stringify(user));
    //const user = ctx.switchToHttp().getRequest() as User;
    //return data ? user && user[userResult] : user;
    return user;
  },
);