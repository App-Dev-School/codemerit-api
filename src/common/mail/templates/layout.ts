const BRAND_COLOR = '#4F46E5';
const TEXT_COLOR = '#1f2937';
const MUTED_COLOR = '#6b7280';

export function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface EmailLayoutOptions {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { preheader = '', heading, bodyHtml, ctaLabel, ctaUrl } = options;
  const ctaHtml = ctaLabel && ctaUrl ? ctaButton(ctaLabel, ctaUrl) : '';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background-color:${BRAND_COLOR};padding:20px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;">CodeMerit</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:${TEXT_COLOR};">${escapeHtml(heading)}</h1>
                <div style="font-size:15px;line-height:1.6;color:${TEXT_COLOR};">
                  ${bodyHtml}
                </div>
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:${MUTED_COLOR};">
                  This is an automated message from CodeMerit. If you weren't expecting this e-mail, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr>
      <td style="border-radius:8px;background-color:${BRAND_COLOR};">
        <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function otpBlock(otp: string): string {
  return `<div style="margin:20px 0;padding:16px;background-color:#f3f4f6;border-radius:8px;text-align:center;">
    <span style="font-size:28px;font-weight:700;letter-spacing:6px;color:${TEXT_COLOR};">${escapeHtml(otp)}</span>
  </div>`;
}
