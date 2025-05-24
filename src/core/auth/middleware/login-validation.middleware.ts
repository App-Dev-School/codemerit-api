// auth/middleware/login-validation.middleware.ts
import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class LoginValidationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const { email, password } = req.body;

    if (!email || email.trim() === '') {
      throw new BadRequestException('Please enter a valid e-mail.');
    }

    if (!password || password.trim() === '') {
      throw new BadRequestException('Please enter your password');
    }

    next();
  }
}
