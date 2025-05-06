import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IDatabaseConfig } from 'src/config/database-config';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseConfig = this.configService.get(
      'database',
    ) as IDatabaseConfig;

    return {
      type: databaseConfig.type,
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [User, Subject, Topic, UserOtp, Question],
      // entities: [__dirname + '/../**/*.entity.{ts,js}'],

      // entities: ['src/**/*.entity.ts'],
      synchronize: true,
    } as TypeOrmModuleOptions;
  }
}
