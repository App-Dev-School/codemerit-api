export interface IProfile {
  id: number;
  linkedinUrl?: string;
  about?: string;
  googleId?: string;
  linkedinId?: string;
  auth_provider?: string;
  selfRatingDone?: boolean;
  playedQuiz?: boolean;
  takenInterview?: boolean;
  level1Assessment?: boolean;
  level2Assessment?: boolean;
}
