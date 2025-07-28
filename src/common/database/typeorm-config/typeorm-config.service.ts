import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IDatabaseConfig } from 'src/config/database-config';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { Trivia } from 'src/common/typeorm/entities/trivia.entity';
import { Option } from 'src/common/typeorm/entities/option.entity';
import { TriviaOption } from 'src/common/typeorm/entities/trivia-option.entity';
import { TriviaTopic } from 'src/common/typeorm/entities/trivia-topic.entity';
@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseConfig = this.configService.get(
      'database',
    ) as IDatabaseConfig;

    return {
      // type: databaseConfig.type,
      // host: databaseConfig.host,
      // port: databaseConfig.port,
      // username: databaseConfig.username,
      // password: databaseConfig.password,
      // database: databaseConfig.database,
      type: 'mysql',
      host: '82.112.234.241',
      port: 3306,
      username: 'codemerituser',
      password: 'GwjU067FL8hcmjQkXjaM',
      database: 'codemeritdb',
      entities: [User, Subject, Topic, UserOtp, Trivia, Option, TriviaOption, TriviaTopic],
      // entities: [__dirname + '/../**/*.entity.{ts,js}'],

      // entities: ['src/**/*.entity.ts'],
      synchronize: false,
    } as TypeOrmModuleOptions;
  }
}
