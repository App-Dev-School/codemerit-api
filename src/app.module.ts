import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './typeorm/entities/user.entity';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Profile } from './typeorm/entities/profile.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './common/services/mail.service';

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
