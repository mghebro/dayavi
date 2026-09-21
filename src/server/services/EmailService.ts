export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }>;
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendTaskAssignedEmail(to: string, taskTitle: string, assignerName: string, taskUrl: string): Promise<void>;
  sendTaskDueSoonEmail(to: string, taskTitle: string, dueDate: string, taskUrl: string): Promise<void>;
  sendWorkspaceInviteEmail(to: string, workspaceName: string, inviterName: string, inviteUrl: string): Promise<void>;
}

function baseTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #FDFBF7; color: #18181B; margin: 0; padding: 40px 20px; }
    .container { max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 2px solid #18181B; border-radius: 16px; box-shadow: 4px 4px 0px 0px #18181B; padding: 32px; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #18181B; margin-bottom: 24px; }
    .brand span { color: #FF6B4A; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #3F3F46; }
    .btn { display: inline-block; background-color: #FF6B4A; color: #FFFFFF !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 2px solid #18181B; box-shadow: 2px 2px 0px 0px #18181B; margin-top: 20px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E4E4E7; font-size: 12px; color: #71717A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">Dayavi<span>.</span> (დაყავი)</div>
    ${bodyContent}
    <div class="footer">
      Sent by Dayavi Task Management Platform. If you did not request this, you can safely ignore this email.
    </div>
  </div>
</body>
</html>
`;
}

class EmailService implements IEmailService {
  private fromAddress = process.env.EMAIL_FROM || "Dayavi <notifications@dayavi.app>";

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    // In development or if no API key is provided, log to console
    if (process.env.NODE_ENV !== "production" || !process.env.RESEND_API_KEY) {
      console.log("----------------------------------------");
      console.log(`📨 [EmailService - Mock Dispatch]`);
      console.log(`From: ${this.fromAddress}`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body Length: ${options.html.length} chars`);
      console.log("----------------------------------------");
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    // Production Resend / SMTP adapter
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });
      const data = (await res.json()) as { id?: string };
      return { success: res.ok, messageId: data.id };
    } catch (err) {
      console.error("Failed to send email via provider:", err);
      return { success: false };
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    const html = baseTemplate(
      "Verify your Dayavi account",
      `
      <h1>Welcome to Dayavi!</h1>
      <p>Please verify your email address to complete your registration and activate your workspace access.</p>
      <a href="${url}" class="btn">Verify Email Address</a>
      <p style="margin-top:24px; font-size: 13px;">Or copy and paste this link into your browser:<br><a href="${url}">${url}</a></p>
      `
    );
    await this.sendEmail({ to, subject: "Verify your Dayavi Account", html });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const html = baseTemplate(
      "Reset your Dayavi Password",
      `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for 1 hour.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <p style="margin-top:24px; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
      `
    );
    await this.sendEmail({ to, subject: "Reset your Dayavi Password", html });
  }

  async sendTaskAssignedEmail(to: string, taskTitle: string, assignerName: string, taskUrl: string): Promise<void> {
    const html = baseTemplate(
      "New Task Assigned to You",
      `
      <h1>You have been assigned a task</h1>
      <p><strong>${assignerName}</strong> assigned you to <strong>"${taskTitle}"</strong>.</p>
      <a href="${taskUrl}" class="btn">View Task</a>
      `
    );
    await this.sendEmail({ to, subject: `Assigned: ${taskTitle}`, html });
  }

  async sendTaskDueSoonEmail(to: string, taskTitle: string, dueDate: string, taskUrl: string): Promise<void> {
    const html = baseTemplate(
      "Task Due Soon Reminder",
      `
      <h1>Task Due Soon</h1>
      <p>The task <strong>"${taskTitle}"</strong> is due on <strong>${dueDate}</strong>.</p>
      <a href="${taskUrl}" class="btn">Open Task</a>
      `
    );
    await this.sendEmail({ to, subject: `Due Soon: ${taskTitle}`, html });
  }

  async sendWorkspaceInviteEmail(to: string, workspaceName: string, inviterName: string, inviteUrl: string): Promise<void> {
    const html = baseTemplate(
      `Invitation to join ${workspaceName}`,
      `
      <h1>Join ${workspaceName} on Dayavi</h1>
      <p><strong>${inviterName}</strong> invited you to collaborate on the <strong>${workspaceName}</strong> workspace.</p>
      <a href="${inviteUrl}" class="btn">Accept Invitation</a>
      `
    );
    await this.sendEmail({ to, subject: `Invitation to join ${workspaceName}`, html });
  }
}

export const emailService: IEmailService = new EmailService();
export default emailService;
