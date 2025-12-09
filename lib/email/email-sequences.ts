/**
 * Email Automation Sequences - BMAD Phase 3
 *
 * Automated email campaigns for:
 * - Welcome sequences
 * - Cart abandonment recovery
 * - Re-engagement campaigns
 * - Milestone celebrations
 *
 * Uses BMAD psychology for maximum conversion
 */

export interface EmailSequence {
  id: string;
  name: string;
  trigger: EmailTrigger;
  emails: SequenceEmail[];
  isActive: boolean;
  stats: SequenceStats;
}

export interface SequenceEmail {
  id: string;
  sequenceId: string;
  order: number;
  delayHours: number;
  subject: string;
  previewText: string;
  template: EmailTemplate;
  variables: EmailVariable[];
}

export type EmailTrigger =
  | "signup"
  | "first_purchase"
  | "cart_abandoned"
  | "inactive_7_days"
  | "inactive_30_days"
  | "streak_at_risk"
  | "level_up"
  | "tier_upgrade"
  | "referral_earned"
  | "milestone_reached";

export type EmailTemplate =
  | "welcome"
  | "xp_reminder"
  | "cart_recovery"
  | "reengagement"
  | "celebration"
  | "streak_alert"
  | "product_recommendation";

export interface EmailVariable {
  key: string;
  description: string;
  example: string;
}

export interface SequenceStats {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
}

export interface QueuedEmail {
  id: string;
  userId: string;
  userEmail: string;
  sequenceId: string;
  emailId: string;
  scheduledFor: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  metadata: Record<string, unknown>;
  createdAt: string;
  sentAt?: string;
}

// In-memory storage for demo
const emailQueue = new Map<string, QueuedEmail>();
const userSequenceStatus = new Map<string, Map<string, {
  startedAt: string;
  currentEmailIndex: number;
  completed: boolean;
}>>();

/**
 * Pre-defined email sequences with BMAD-optimized copy
 */
export const EMAIL_SEQUENCES: EmailSequence[] = [
  // Welcome Sequence
  {
    id: "welcome",
    name: "Welcome Sequence",
    trigger: "signup",
    isActive: true,
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
    emails: [
      {
        id: "welcome-1",
        sequenceId: "welcome",
        order: 1,
        delayHours: 0,
        subject: "Welcome to Hamilton Bailey Law - Your XP Journey Starts Now!",
        previewText: "Earn your first 100 XP in the next 5 minutes",
        template: "welcome",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "signupXP", description: "XP earned for signing up", example: "50" },
        ],
      },
      {
        id: "welcome-2",
        sequenceId: "welcome",
        order: 2,
        delayHours: 48,
        subject: "{{firstName}}, you're 150 XP away from $5 off!",
        previewText: "Complete the ROI Calculator to earn 150+ XP",
        template: "xp_reminder",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "currentXP", description: "User's current XP", example: "50" },
          { key: "xpToDiscount", description: "XP needed for discount", example: "150" },
        ],
      },
      {
        id: "welcome-3",
        sequenceId: "welcome",
        order: 3,
        delayHours: 120,
        subject: "Your Compliance Health Score + 700 XP",
        previewText: "Take the quiz to find gaps and earn massive XP",
        template: "product_recommendation",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
        ],
      },
      {
        id: "welcome-4",
        sequenceId: "welcome",
        order: 4,
        delayHours: 240,
        subject: "{{firstName}}, here's what other practitioners are buying",
        previewText: "See the most popular templates in your specialty",
        template: "product_recommendation",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "specialty", description: "User's specialty", example: "General Practice" },
        ],
      },
    ],
  },

  // Cart Abandonment Sequence
  {
    id: "cart-abandoned",
    name: "Cart Abandonment Recovery",
    trigger: "cart_abandoned",
    isActive: true,
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
    emails: [
      {
        id: "cart-1",
        sequenceId: "cart-abandoned",
        order: 1,
        delayHours: 3,
        subject: "You left {{itemCount}} items in your cart",
        previewText: "Complete your purchase to earn {{potentialXP}} XP",
        template: "cart_recovery",
        variables: [
          { key: "itemCount", description: "Number of cart items", example: "2" },
          { key: "potentialXP", description: "XP they'd earn", example: "180" },
          { key: "cartTotal", description: "Cart total", example: "$149" },
        ],
      },
      {
        id: "cart-2",
        sequenceId: "cart-abandoned",
        order: 2,
        delayHours: 24,
        subject: "⚠️ You're {{xpToDiscount}} XP from a ${{discountAmount}} discount",
        previewText: "Complete this purchase and you'll have enough XP!",
        template: "cart_recovery",
        variables: [
          { key: "xpToDiscount", description: "XP to next discount tier", example: "50" },
          { key: "discountAmount", description: "Discount amount", example: "10" },
        ],
      },
      {
        id: "cart-3",
        sequenceId: "cart-abandoned",
        order: 3,
        delayHours: 72,
        subject: "Last chance: Your cart expires soon",
        previewText: "Reserved items + exclusive 10% discount inside",
        template: "cart_recovery",
        variables: [
          { key: "exclusiveDiscount", description: "Recovery discount", example: "10%" },
        ],
      },
    ],
  },

  // Re-engagement Sequence (30 days inactive)
  {
    id: "reengagement-30",
    name: "30-Day Re-engagement",
    trigger: "inactive_30_days",
    isActive: true,
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
    emails: [
      {
        id: "reengage-1",
        sequenceId: "reengagement-30",
        order: 1,
        delayHours: 0,
        subject: "We miss you, {{firstName}}!",
        previewText: "Come back and claim your 500 bonus XP",
        template: "reengagement",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "comebackBonus", description: "Bonus XP for returning", example: "500" },
        ],
      },
      {
        id: "reengage-2",
        sequenceId: "reengagement-30",
        order: 2,
        delayHours: 168, // 7 days
        subject: "{{firstName}}, your XP is waiting to be claimed",
        previewText: "You have {{unclaimedXP}} XP in pending rewards",
        template: "reengagement",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "unclaimedXP", description: "Pending XP", example: "750" },
        ],
      },
    ],
  },

  // Streak At Risk Alert
  {
    id: "streak-alert",
    name: "Streak Protection Alert",
    trigger: "streak_at_risk",
    isActive: true,
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
    emails: [
      {
        id: "streak-1",
        sequenceId: "streak-alert",
        order: 1,
        delayHours: 0,
        subject: "🔥 Your {{streakDays}}-day streak ends in 4 hours!",
        previewText: "Quick action needed to save your streak",
        template: "streak_alert",
        variables: [
          { key: "streakDays", description: "Current streak days", example: "14" },
          { key: "streakMultiplier", description: "Current multiplier", example: "1.4x" },
        ],
      },
    ],
  },

  // Milestone Celebration
  {
    id: "milestone-celebration",
    name: "Milestone Celebrations",
    trigger: "milestone_reached",
    isActive: true,
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
    emails: [
      {
        id: "milestone-1",
        sequenceId: "milestone-celebration",
        order: 1,
        delayHours: 0,
        subject: "🎉 Congratulations! You've reached {{milestoneName}}!",
        previewText: "You've earned {{milestoneReward}} - celebrate your achievement",
        template: "celebration",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "milestoneName", description: "Milestone name", example: "Level 5" },
          { key: "milestoneReward", description: "Reward earned", example: "1000 XP" },
        ],
      },
    ],
  },

  // Tier Upgrade
  {
    id: "tier-upgrade",
    name: "Membership Tier Upgrade",
    trigger: "tier_upgrade",
    isActive: true,
    stats: { sent: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
    emails: [
      {
        id: "tier-1",
        sequenceId: "tier-upgrade",
        order: 1,
        delayHours: 0,
        subject: "🏆 You've been upgraded to {{newTier}}!",
        previewText: "Unlock your new {{tierDiscount}} discount and exclusive benefits",
        template: "celebration",
        variables: [
          { key: "firstName", description: "User's first name", example: "Sarah" },
          { key: "newTier", description: "New tier name", example: "Gold" },
          { key: "tierDiscount", description: "Tier discount", example: "15%" },
        ],
      },
    ],
  },
];

/**
 * Start an email sequence for a user
 */
export function startSequence(
  userId: string,
  userEmail: string,
  sequenceId: string,
  metadata: Record<string, unknown> = {}
): QueuedEmail[] {
  const sequence = EMAIL_SEQUENCES.find((s) => s.id === sequenceId);
  if (!sequence || !sequence.isActive) return [];

  // Check if user is already in this sequence
  const userSequences = userSequenceStatus.get(userId) || new Map();
  if (userSequences.has(sequenceId)) {
    const status = userSequences.get(sequenceId);
    if (status && !status.completed) {
      return []; // Already in sequence
    }
  }

  // Queue all emails in sequence
  const queuedEmails: QueuedEmail[] = [];
  const now = new Date();

  for (const email of sequence.emails) {
    const scheduledFor = new Date(
      now.getTime() + email.delayHours * 60 * 60 * 1000
    );

    const queued: QueuedEmail = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userEmail,
      sequenceId,
      emailId: email.id,
      scheduledFor: scheduledFor.toISOString(),
      status: "pending",
      metadata,
      createdAt: now.toISOString(),
    };

    emailQueue.set(queued.id, queued);
    queuedEmails.push(queued);
  }

  // Track sequence status
  userSequences.set(sequenceId, {
    startedAt: now.toISOString(),
    currentEmailIndex: 0,
    completed: false,
  });
  userSequenceStatus.set(userId, userSequences);

  return queuedEmails;
}

/**
 * Cancel a sequence for a user
 */
export function cancelSequence(userId: string, sequenceId: string): number {
  let cancelledCount = 0;

  emailQueue.forEach((email, id) => {
    if (
      email.userId === userId &&
      email.sequenceId === sequenceId &&
      email.status === "pending"
    ) {
      email.status = "cancelled";
      emailQueue.set(id, email);
      cancelledCount++;
    }
  });

  // Mark sequence as completed
  const userSequences = userSequenceStatus.get(userId);
  if (userSequences?.has(sequenceId)) {
    const status = userSequences.get(sequenceId);
    if (status) {
      status.completed = true;
      userSequences.set(sequenceId, status);
    }
  }

  return cancelledCount;
}

/**
 * Get pending emails ready to send
 */
export function getPendingEmails(): QueuedEmail[] {
  const now = new Date();
  const pending: QueuedEmail[] = [];

  emailQueue.forEach((email) => {
    if (
      email.status === "pending" &&
      new Date(email.scheduledFor) <= now
    ) {
      pending.push(email);
    }
  });

  return pending.sort(
    (a, b) =>
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
}

/**
 * Mark email as sent
 */
export function markEmailSent(emailId: string): void {
  const email = emailQueue.get(emailId);
  if (email) {
    email.status = "sent";
    email.sentAt = new Date().toISOString();
    emailQueue.set(emailId, email);

    // Update sequence stats
    const sequence = EMAIL_SEQUENCES.find((s) => s.id === email.sequenceId);
    if (sequence) {
      sequence.stats.sent++;
    }
  }
}

/**
 * Get user's email sequence status
 */
export function getUserSequenceStatus(
  userId: string
): Map<string, { startedAt: string; currentEmailIndex: number; completed: boolean }> {
  return userSequenceStatus.get(userId) || new Map();
}

/**
 * Get sequence by trigger
 */
export function getSequenceByTrigger(trigger: EmailTrigger): EmailSequence | undefined {
  return EMAIL_SEQUENCES.find((s) => s.trigger === trigger && s.isActive);
}

/**
 * Trigger an email sequence based on event
 */
export function triggerEmailSequence(
  trigger: EmailTrigger,
  userId: string,
  userEmail: string,
  metadata: Record<string, unknown> = {}
): QueuedEmail[] {
  const sequence = getSequenceByTrigger(trigger);
  if (!sequence) return [];

  return startSequence(userId, userEmail, sequence.id, metadata);
}

/**
 * Email template content generator
 */
export function generateEmailContent(
  email: SequenceEmail,
  variables: Record<string, string | number>
): {
  subject: string;
  previewText: string;
  htmlContent: string;
} {
  // Replace variables in subject and preview
  let subject = email.subject;
  let previewText = email.previewText;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    subject = subject.replace(regex, String(value));
    previewText = previewText.replace(regex, String(value));
  }

  // Generate HTML based on template
  const htmlContent = generateTemplateHtml(email.template, variables);

  return { subject, previewText, htmlContent };
}

/**
 * Generate HTML for email template
 */
function generateTemplateHtml(
  template: EmailTemplate,
  variables: Record<string, string | number>
): string {
  const firstName = variables.firstName || "there";

  const templates: Record<EmailTemplate, string> = {
    welcome: `
      <h1>Welcome, ${firstName}!</h1>
      <p>You've just joined Hamilton Bailey Law's XP rewards program.</p>
      <p>You've already earned <strong>${variables.signupXP || 50} XP</strong> just for signing up!</p>
      <p>Here's how to earn more XP:</p>
      <ul>
        <li>Complete the ROI Calculator: +150 XP</li>
        <li>Take the Compliance Quiz: +700 XP</li>
        <li>Make your first purchase: +10% of spend as XP</li>
      </ul>
      <a href="/tools/roi-calculator" class="button">Start Earning XP Now</a>
    `,
    xp_reminder: `
      <h1>You're so close, ${firstName}!</h1>
      <p>You currently have <strong>${variables.currentXP} XP</strong>.</p>
      <p>Just <strong>${variables.xpToDiscount} more XP</strong> and you'll unlock a discount!</p>
      <a href="/tools" class="button">Earn XP Now</a>
    `,
    cart_recovery: `
      <h1>You left something behind!</h1>
      <p>Your cart is waiting with ${variables.itemCount || "your"} items.</p>
      <p>Complete your purchase to earn <strong>${variables.potentialXP} XP</strong>!</p>
      ${variables.exclusiveDiscount ? `<p>Use code COMEBACK for ${variables.exclusiveDiscount} off!</p>` : ""}
      <a href="/cart" class="button">Complete Your Purchase</a>
    `,
    reengagement: `
      <h1>We miss you, ${firstName}!</h1>
      <p>It's been a while since we've seen you.</p>
      <p>Come back now and claim <strong>${variables.comebackBonus || 500} bonus XP</strong>!</p>
      <a href="/" class="button">Claim Your Bonus</a>
    `,
    celebration: `
      <h1>Congratulations, ${firstName}! 🎉</h1>
      <p>You've achieved something amazing!</p>
      <p><strong>${variables.milestoneName || variables.newTier}</strong></p>
      <p>Your reward: <strong>${variables.milestoneReward || variables.tierDiscount}</strong></p>
      <a href="/dashboard" class="button">See Your Achievement</a>
    `,
    streak_alert: `
      <h1>🔥 Streak Alert!</h1>
      <p>Your <strong>${variables.streakDays}-day streak</strong> is about to end!</p>
      <p>You'll lose your <strong>${variables.streakMultiplier} XP multiplier</strong> if you don't act now.</p>
      <p>Just complete one quick action to save your streak:</p>
      <a href="/tools/roi-calculator" class="button">Save My Streak</a>
    `,
    product_recommendation: `
      <h1>Picked for you, ${firstName}</h1>
      <p>Based on your profile, here are some templates that might help your practice:</p>
      <ul>
        <li>AHPRA Compliance Bundle</li>
        <li>Employment Contract Pack</li>
        <li>Telehealth Setup Kit</li>
      </ul>
      <a href="/products" class="button">View Recommendations</a>
    `,
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        }
        h1 { color: #1F2937; }
        strong { color: #4F46E5; }
      </style>
    </head>
    <body>
      ${templates[template]}
      <hr>
      <p style="font-size: 12px; color: #666;">
        Hamilton Bailey Law | <a href="/unsubscribe">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;
}
