import { ModeEnum } from 'src/common/enum/quiz-settings.enum';

export class PublishedQuizFilterDto {
    subjectId?: number;
    topicId?: number;
    jobRoleId?: number;
    mode?: ModeEnum;
}

