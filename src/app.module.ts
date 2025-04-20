import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import jwtConfig from './auth/config/jwt.config';
import { LoggerModule } from './common/services/logger.module';
import { PostsModule } from './posts/posts.module';
import { TopicsModule } from './topics/topics.module';
import { UsersModule } from './users/users.module';
import { PaginationModule } from './common/pagination/pagination.module';
import { MailModule } from './mail/mail.module';
import { User } from './typeorm/entities/user.entity';
import { Post } from './posts/post.entity';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { Subject } from './typeorm/entities/subject.entity';
import { SubjectsModule } from './subjects/subjects.module';
import { Topic } from './topics/topic.entity';

@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        entities: [User, Subject, Topic, Post],
        synchronize: true,
        port: 3306,
        username: 'codemerit',
        password: 'codemerit',
        host: 'localhost',
        //autoLoadEntities: true,
        database: 'codemeritdb',
        
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    LoggerModule,
    SubjectsModule,
    TopicsModule,
    PaginationModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, 
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      transform: true
    }),
  },
  AccessTokenGuard
],
})
export class AppModule {}
