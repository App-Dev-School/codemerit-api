import { UserOtpTagsEnum } from 'src/core/users/enums/user-otp-Tags.enum';
import { escapeHtml, otpBlock, renderEmailLayout } from './layout';

export interface EmailTemplate {
  subject: string;
  html: string;
}

export function registrationWelcomeTemplate(
  name: string,
  otp: string,
): EmailTemplate {
  const safeName = escapeHtml(name);
  return {
    subject: 'Welcome to CodeMerit — verify your account',
    html: renderEmailLayout({
      preheader: 'Use this code to verify your CodeMerit account.',
      heading: `Welcome, ${safeName}!`,
      bodyHtml: `
        <p>Thanks for signing up for CodeMerit. Use the code below to verify your account and get started.</p>
        ${otpBlock(otp)}
        <p>This code expires shortly, so verify soon. If you didn't create this account, you can ignore this e-mail.</p>
      `,
    }),
  };
}

export function otpTemplate(
  name: string,
  otp: string,
  tag: UserOtpTagsEnum,
): EmailTemplate {
  const safeName = escapeHtml(name);
  if (tag === UserOtpTagsEnum.PWD_RECOVER) {
    return {
      subject: 'Reset your CodeMerit password',
      html: renderEmailLayout({
        preheader: 'Use this code to reset your CodeMerit password.',
        heading: 'Reset your password',
        bodyHtml: `
          <p>Hi ${safeName}, use the code below to reset your CodeMerit password.</p>
          ${otpBlock(otp)}
          <p>If you didn't request a password reset, you can safely ignore this e-mail — your password won't change.</p>
        `,
      }),
    };
  }
  return {
    subject: 'Verify your CodeMerit account',
    html: renderEmailLayout({
      preheader: 'Use this code to verify your CodeMerit account.',
      heading: 'Verify your account',
      bodyHtml: `
        <p>Hi ${safeName}, use the code below to verify your CodeMerit account.</p>
        ${otpBlock(otp)}
        <p>If you didn't request this, you can safely ignore this e-mail.</p>
      `,
    }),
  };
}

export function accountVerifiedTemplate(name: string): EmailTemplate {
  const safeName = escapeHtml(name);
  return {
    subject: 'Your CodeMerit account is verified',
    html: renderEmailLayout({
      preheader: 'Your account is verified and ready to go.',
      heading: `You're all set, ${safeName}!`,
      bodyHtml: `
        <p>Your CodeMerit account is now verified. You can sign in and start taking quizzes, tracking your progress, and earning certificates.</p>
      `,
      ctaLabel: 'Go to CodeMerit',
      ctaUrl: '{{FRONTEND_URL}}',
    }),
  };
}

export function passwordChangedTemplate(name: string): EmailTemplate {
  const safeName = escapeHtml(name);
  return {
    subject: 'Your CodeMerit password was changed',
    html: renderEmailLayout({
      preheader: 'Your password was just changed.',
      heading: 'Password changed',
      bodyHtml: `
        <p>Hi ${safeName}, this confirms your CodeMerit password was just changed.</p>
        <p>If you didn't make this change, please reset your password immediately and contact support.</p>
      `,
    }),
  };
}

export function roleEnrolledTemplate(
  name: string,
  jobRoleTitle: string,
): EmailTemplate {
  const safeName = escapeHtml(name);
  const safeRole = escapeHtml(jobRoleTitle);
  return {
    subject: `You're enrolled in ${jobRoleTitle}`,
    html: renderEmailLayout({
      preheader: `You're now on the ${jobRoleTitle} career track.`,
      heading: `Welcome to ${safeRole}`,
      bodyHtml: `
        <p>Hi ${safeName}, you're now enrolled in the <strong>${safeRole}</strong> career track. Your progress across its subjects and subject tracks will now count toward this role's certifications.</p>
      `,
      ctaLabel: 'View your career dashboard',
      ctaUrl: '{{FRONTEND_URL}}',
    }),
  };
}

export function certificateIssuedTemplate(
  name: string,
  trackTitle: string,
  certificateNumber: string,
): EmailTemplate {
  const safeName = escapeHtml(name);
  const safeTrack = escapeHtml(trackTitle);
  const safeCertNumber = escapeHtml(certificateNumber);
  return {
    subject: `You earned the ${trackTitle} certificate!`,
    html: renderEmailLayout({
      preheader: `Congratulations on earning the ${trackTitle} certificate.`,
      heading: 'Congratulations! 🎉',
      bodyHtml: `
        <p>Hi ${safeName}, you've earned the <strong>${safeTrack}</strong> certificate.</p>
        <p>Certificate number: <strong>${safeCertNumber}</strong></p>
      `,
      ctaLabel: 'View your certificate',
      ctaUrl: '{{FRONTEND_URL}}',
    }),
  };
}

export function badgeEarnedTemplate(
  name: string,
  badgeName: string,
): EmailTemplate {
  const safeName = escapeHtml(name);
  const safeBadge = escapeHtml(badgeName);
  return {
    subject: `New badge earned: ${badgeName}`,
    html: renderEmailLayout({
      preheader: `You earned the ${badgeName} badge.`,
      heading: 'New badge earned!',
      bodyHtml: `
        <p>Hi ${safeName}, you just earned the <strong>${safeBadge}</strong> badge.</p>
      `,
      ctaLabel: 'View your badges',
      ctaUrl: '{{FRONTEND_URL}}',
    }),
  };
}

export function streakMilestoneTemplate(
  name: string,
  days: number,
): EmailTemplate {
  const safeName = escapeHtml(name);
  return {
    subject: `${days}-day streak! Keep it up`,
    html: renderEmailLayout({
      preheader: `You're on a ${days}-day streak.`,
      heading: `You're on a ${days}-day streak!`,
      bodyHtml: `
        <p>Hi ${safeName}, you've been active on CodeMerit for ${days} days in a row. Keep the streak alive by practicing today.</p>
      `,
      ctaLabel: 'Keep the streak going',
      ctaUrl: '{{FRONTEND_URL}}',
    }),
  };
}

export function levelUpTemplate(
  name: string,
  level: number,
  levelTitle: string,
): EmailTemplate {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(levelTitle);
  return {
    subject: `You leveled up to Level ${level}: ${levelTitle}`,
    html: renderEmailLayout({
      preheader: `You reached Level ${level}: ${levelTitle}.`,
      heading: 'Level up!',
      bodyHtml: `
        <p>Hi ${safeName}, you've leveled up to <strong>Level ${level}: ${safeTitle}</strong>. Keep earning XP to reach the next level.</p>
      `,
      ctaLabel: 'View your progress',
      ctaUrl: '{{FRONTEND_URL}}',
    }),
  };
}
