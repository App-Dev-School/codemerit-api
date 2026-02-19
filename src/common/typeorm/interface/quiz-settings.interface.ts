import { OrderingEnum, ModeEnum } from 'src/common/enum/quiz-settings.enum';

export interface IQuizSettings {
  id: number;
  numQuestions: number;
  ordering: OrderingEnum;
  mode: ModeEnum;
  showHint: boolean;
  showAnswers: boolean;
  enableNavigation: boolean;
  enableAudio: boolean;
  enableTimer: boolean;
  enableCertificate: boolean;
  quizId: number;
}
