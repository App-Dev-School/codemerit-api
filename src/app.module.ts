import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/services/logger.module';
import { Profile } from './typeorm/entities/profile.entity';
import { User } from './typeorm/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'codemerit',
      database: 'codemeritdb',
      entities: [User, Profile],
      synchronize: true
    }),
    LoggerModule,
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, 
    {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      transform: true
    }),
  },
],
})
export class AppModule {}
