import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthService } from './providers/auth.service';
import { LocalStrategy } from './guards/local.strategy';
import { LoginValidationMiddleware } from './middleware/login-validation.middleware';
import { UserPermissionModule } from 'src/modules/user-permission/user-permission.module';
import { TopicAnalysisService } from 'src/modules/master/providers/topic-analysis.service';
import { SubjectAnalysisService } from 'src/modules/master/providers/subject-analysis.service';
import { MasterModule } from 'src/modules/master/master.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'secret@1234#',
      signOptions: { expiresIn: '1d' },
    }),
    UserPermissionModule,
    MasterModule
    //TopicAnalysisService,
    //SubjectAnalysisService
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('auth/login');
  }
}
