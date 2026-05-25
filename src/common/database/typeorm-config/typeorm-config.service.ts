import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { SkillRating } from 'src/common/typeorm/entities/skill-rating.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { IDatabaseConfig } from 'src/config/database-config';
import { QuizSettings } from 'src/common/typeorm/entities/quiz-settings.entity';
import { UserJobRole } from 'src/common/typeorm/entities/user-job-role.entity';
import { ApiUsage } from 'src/common/typeorm/entities/api-usage.entity';
import { Notification } from 'src/common/typeorm/entities/notification.entity';
@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseConfig = this.configService.get(
      'database',
    ) as IDatabaseConfig;

    // Import the custom logger
    const { MetricsTypeOrmLogger } = require('../../metrics/metrics-typeorm-logger');
    return {
      type: databaseConfig.type,
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [
        User,
        Profile,
        Subject,
        JobRole,
        JobRoleSubject,
        UserSubject,
        Topic,
        UserOtp,
        Question,
        QuestionOption,
        QuestionTopic,
        AssessmentSession,
        SkillRating,
        QuestionAttempt,
        Quiz,
        QuizResult,
        QuizQuestion,
        QuizSubject,
        QuizTopic,
        QuizSettings,
        Permission,
        UserPermission,
        UserJobRole,
        ApiUsage,
        Notification,
      ],
      synchronize: true,
      logger: new MetricsTypeOrmLogger(),
    } as TypeOrmModuleOptions;
  }
}
