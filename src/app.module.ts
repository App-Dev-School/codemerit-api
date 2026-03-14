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
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { MasterModule } from './modules/master/master.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiUsageInterceptor } from './common/interceptors/api-usage.interceptor';
import { ApiUsageModule } from './common/services/api-usage.module';

@Module({
  imports: [
    MasterModule,
    CoreModule,
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig],
      isGlobal: true,
    }),
    LoggerModule,
    DatabaseModule,
    ApiUsageModule,
    DomainModule,
    MonitoringModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiUsageInterceptor,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized');
    console.log('##### Env.DB_HOST:', process.env.DB_HOST);
  }
}
