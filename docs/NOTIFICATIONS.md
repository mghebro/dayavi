# Dayavi (დაყავი) — Notification & Email Architecture

## 1. Notification Philosophy

Dayavi separates **notification generation** (domain events) from **notification delivery** (in-app display and transactional email). This decoupling ensures that adding new channels (e.g. webhooks, Slack) requires zero modification to core task mutation services:

```text
Domain Event (e.g., Task Assigned, Comment Added)
         │
         ▼
Notification Service
         │
    ┌────┴────────────────────────┐
    ▼                             ▼
In-App Notification Record    Email Notification Service
(Prisma PostgreSQL)           (Abstracted Provider Adapter)
```

---

## 2. In-App Notification Center

### 2.1 Storage & Schema
In-app notifications are persisted in the `Notification` table:
* `id`, `userId`, `type` (`TASK_ASSIGNED`, `TASK_COMMENT`, `TASK_DUE_SOON`, `WORKSPACE_INVITE`, `TASK_STATUS_CHANGED`)
* `title`, `message`, `linkUrl`, `read: Boolean`, `createdAt: DateTime`

### 2.2 User Experience & UI
* **TopBar Bell**: Displays a real-time unread badge counter (e.g., `3`).
* **Notification Flyout & Full Page**: Displays categorized notifications (Today, Earlier) with relative timestamps (`10m ago`, `2h ago`).
* **Actions**:
  - Click notification: Marks notification as read and navigates directly to the referenced entity.
  - "Mark all as read": Single-click action updating all unread records for the user.

---

## 3. Email Architecture (`src/server/services/EmailService.ts`)

### 3.1 Abstracted Email Service
Dayavi encapsulates email delivery behind an interface rather than coupling business logic to a single provider:

```typescript
export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailService {
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }>;
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendTaskAssignedEmail(to: string, taskTitle: string, assignerName: string, taskUrl: string): Promise<void>;
  sendTaskDueSoonEmail(to: string, taskTitle: string, dueDate: string, taskUrl: string): Promise<void>;
}
```

### 3.2 Provider Selection & Configuration
Delivery providers are resolved dynamically based on environment variables:
* **Development / Testing**: Defaults to `ConsoleEmailAdapter` or mock logger, printing styled email previews directly to stdout without needing third-party API credentials.
* **Production**: Automatically connects to Resend or SMTP when `RESEND_API_KEY` or `SMTP_HOST` environment variables are present.

### 3.3 Editorial Email Templates
Emails are styled with Dayavi's warm paper and soft neo-brutalist aesthetic using responsive HTML/CSS tables, featuring bold headers, clear CTA buttons, and minimal visual noise.

---

## 4. User Notification Preferences

Every user can customize notification delivery channels via `NotificationPreference`:
* `emailOnAssignment`: Receive email when assigned to a task (Default: `true`).
* `emailOnComment`: Receive email when someone comments on a task you created or are assigned to (Default: `true`).
* `emailOnDueSoon`: Receive reminder email 24 hours prior to task due date (Default: `true`).
* `inAppEnabled`: Toggle in-app alert badges (Default: `true`).
