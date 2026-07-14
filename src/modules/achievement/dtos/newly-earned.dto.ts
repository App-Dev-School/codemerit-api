import { LevelTier } from '../constants/gamification.constants';

export interface NewlyEarnedBadge {
  code: string;
  name: string;
}

export interface NewlyEarnedCertificate {
  certificationTrackId: number;
  certificateNumber: string;
}

export interface NewlyEarnedStreak {
  current: number;
  longest: number;
  milestoneHit?: number;
}

export interface NewlyEarnedDto {
  xpAwarded: number;
  totalPoints: number;
  level: LevelTier;
  leveledUp: boolean;
  streak: NewlyEarnedStreak;
  badgesEarned: NewlyEarnedBadge[];
  certificatesEarned: NewlyEarnedCertificate[];
}
