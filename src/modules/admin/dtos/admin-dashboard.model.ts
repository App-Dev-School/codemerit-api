// ---------------------
// Generic Time Series Types
// ---------------------
export interface DailySeriesItem {
  date: string; // ISO date string
  count: number;
}

export interface WeeklySeriesItem {
  week: string; // e.g. "2025-W43"
  count: number;
}

export interface DailyTimeSeries {
  users: DailySeriesItem[];
  questions: DailySeriesItem[];
  quizzes: DailySeriesItem[];
  attempts: DailySeriesItem[];
}

export interface WeeklyTimeSeries {
  users: WeeklySeriesItem[];
  questions: WeeklySeriesItem[];
  quizzes: WeeklySeriesItem[];
  attempts: WeeklySeriesItem[];
}

export interface TimeSeriesStats {
  daily: DailyTimeSeries;
  weekly: WeeklyTimeSeries;
}

// ---------------------
// Entity Metrics
// ---------------------
export interface AttemptStats {
  total: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  distinctUsers: number;
}

export interface QuestionStats {
  total: number;
  totalTrivia: number;
  totalGeneral: number;
  totalTriviaActive: number;
  totalGeneralActive: number;
  totalTriviaPending: number;
  totalGeneralPending: number;
}

export interface UserStats {
  total: number;
  totalActive: number;
  totalPending: number;
  totalBlocked: number;
  totalWithDesignation: number;
  totalModerators: number;
}

export interface TopicStats {
  total: number;
  totalActive: number;
  totalPending: number;
}

export interface SubjectStats {
  total: number;
  totalActive: number;
  totalInactive: number;
}

export interface QuizStats {
  total: number;
  totalActive: number;
  totalInactive: number;
  playedQuizzes: number;
  totalPlays: number;
  avgPlaysPerQuiz: number;
  avgScore: number;
}

// ---------------------
// Combined Dashboard Data
// ---------------------
export interface AdminDashboardData {
  attempts: AttemptStats;
  questions: QuestionStats;
  users: UserStats;
  topics: TopicStats;
  subjects: SubjectStats;
  quizzes: QuizStats;
  timeSeries: TimeSeriesStats;
}

// ---------------------
// Nested Response DTOs
// ---------------------
// export interface AdminDashboardInnerResponse {
//   error: boolean;
//   message: string;
//   data: AdminDashboardData;
// }

export interface AdminDashboardResponse {
  error: boolean;
  result_code: number;
  message: string;
  data: AdminDashboardData;
}