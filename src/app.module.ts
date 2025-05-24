import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { databaseConfig } from './config/database-config';
import { appConfig } from './config/app-config';
import { jwtConfig } from './config/jwt-config';
import { LoggerModule } from './common/services/logger.module';
import { CoreModule } from './core/core.module';
import { DomainModule } from './modules/domain.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/auth/jwt/jwt-auth-guard';
import { RolesGuard } from './core/auth/guards/roles.guard';

@Module({
  imports: [
    CoreModule,
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig],
      isGlobal: true,
    }),
    LoggerModule,
    DatabaseModule,
    DomainModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
