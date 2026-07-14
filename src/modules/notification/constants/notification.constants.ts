export const NOTIFICATION_MESSAGES = {
  ACCOUNT_VERIFIED: 'Welcome {name}! Your account is now verified.',
  ROLE_ENROLLED: 'Hi {name} you just enrolled as {JobRole}.',
  QUIZ_COMPLETED: 'You have completed the {QuizName} and obatined {score}%.',
  CERTIFICATE_ISSUED: 'Congratulations! You earned the {trackTitle} certificate ({certificateNumber}).',
  BADGE_EARNED: 'You earned a new badge: {badgeName}!',
  STREAK_MILESTONE: "You're on a {days}-day streak! Keep it going.",
  LEVEL_UP: 'You leveled up to Level {level}: {levelTitle}!',
} as const;
