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
import { JwtAuthGuard } from './core/auth/jwt-auth-guard';
import { RolesGuard } from './core/auth/roles.guard';

@Module({
  imports: [
    // UsersModule,
    // PostsModule,
    CoreModule,
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig],
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     // entities: [User, Subject, Topic, Post],
    //     entities: [join(__dirname, '**', 'typeorm', 'entities', '*.{ts,js}')],
    //     synchronize: true,
    //     port: 5432,
    //     username: 'postgres',
    //     password: '12345678',
    //     host: 'localhost',
    //     //autoLoadEntities: true,
    //     database: 'codemeritdb',
    //   }),
    // }),
    // ConfigModule.forFeature(jwtConfig),
    // JwtModule.registerAsync(jwtConfig.asProvider()),
    LoggerModule,
    // SubjectsModule,
    // TopicsModule,
    // PaginationModule,
    // MailModule,
    DatabaseModule,
    DomainModule,
    CoreModule,
  ],
  // controllers: [AppController],
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

  // providers: [
  //   AppService,
  //   {
  //     provide: APP_GUARD,
  //     useClass: AuthenticationGuard,
  //   },
  //   {
  //     provide: APP_PIPE,
  //     useValue: new ValidationPipe({
  //       transform: true,
  //     }),
  //   },
  //   AccessTokenGuard,
  // ],
})
export class AppModule {}
