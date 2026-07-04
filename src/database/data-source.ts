import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ApiUsage } from 'src/common/typeorm/entities/api-usage.entity';
import { AssessmentSession } from 'src/common/typeorm/entities/assessment-session.entity';
import { Certificate } from 'src/common/typeorm/entities/certificate.entity';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { CertificationTrackSubjectTrack } from 'src/common/typeorm/entities/certification-track-subject-track.entity';
import { Interview } from 'src/common/typeorm/entities/interview.entity';
import { InterviewStatusHistory } from 'src/common/typeorm/entities/interview-status-history.entity';
import { JobRole } from 'src/common/typeorm/entities/job-role.entity';
import { JobRoleSubject } from 'src/common/typeorm/entities/job-role-subject.entity';
import { Lesson } from 'src/common/typeorm/entities/lesson.entity';
import { LessonSection } from 'src/common/typeorm/entities/lesson-section.entity';
import { Notification } from 'src/common/typeorm/entities/notification.entity';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { Profile } from 'src/common/typeorm/entities/profile.entity';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';
import { QuestionOption } from 'src/common/typeorm/entities/question-option.entity';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { Quiz } from 'src/common/typeorm/entities/quiz.entity';
import { QuizQuestion } from 'src/common/typeorm/entities/quiz-quesion.entity';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';
import { QuizSettings } from 'src/common/typeorm/entities/quiz-settings.entity';
import { QuizSubject } from 'src/common/typeorm/entities/quiz-subject.entity';
import { QuizTopic } from 'src/common/typeorm/entities/quiz-topic.entity';
import { SkillMetric } from 'src/common/typeorm/entities/skill-metric.entity';
import { SkillRating } from 'src/common/typeorm/entities/skill-rating.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';
import { UserJobRole } from 'src/common/typeorm/entities/user-job-role.entity';
import { UserLessonTracker } from 'src/common/typeorm/entities/user-lesson-tracker.entity';
import { UserOtp } from 'src/common/typeorm/entities/user-otp.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'codemerituser',
  password: process.env.DB_PASSWORD ?? 'GwjU067FL8hcmjQkXjaM',
  database: process.env.DB_DATABASE || 'codemeritdb',
  entities: [
    User, Profile, Subject, JobRole, JobRoleSubject, UserJobRole, UserSubject,
    Topic, UserOtp, Question, QuestionOption, QuestionTopic, AssessmentSession,
    SkillRating, QuestionAttempt, Quiz, QuizResult, QuizQuestion, QuizSubject,
    QuizTopic, QuizSettings, Lesson, LessonSection, UserLessonTracker,
    Permission, UserPermission, ApiUsage, Notification, SkillMetric,
    Interview, InterviewStatusHistory, CertificationTrack, SubjectTrack,
    CertificationTrackSubjectTrack, SubjectTrackTopic, Certificate,
  ],
  synchronize: false,
});
