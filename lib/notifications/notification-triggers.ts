/**
 * Notification Triggers
 * Helper functions to create notifications from various app events
 */

import {
  createNotification,
  NotificationType,
  wasRecentlySent,
} from "@/lib/db/notifications";

// ============================================
// BOOKING NOTIFICATIONS
// ============================================

/**
 * Notify user of booking confirmation
 */
export async function notifyBookingConfirmed(
  userEmail: string,
  bookingDetails: {
    consultationType: string;
    date: string;
    time: string;
    meetingLink?: string;
    bookingId: string;
  }
): Promise<string | null> {
  const notification = await createNotification({
    userEmail,
    type: "booking",
    title: "Booking Confirmed",
    message: `Your ${bookingDetails.consultationType} is confirmed for ${bookingDetails.date} at ${bookingDetails.time}.`,
    actionUrl: "/client-portal",
    metadata: {
      bookingId: bookingDetails.bookingId,
      consultationType: bookingDetails.consultationType,
      date: bookingDetails.date,
      time: bookingDetails.time,
      meetingLink: bookingDetails.meetingLink,
    },
  });

  return notification?.id || null;
}

/**
 * Notify user of upcoming booking reminder
 */
export async function notifyBookingReminder(
  userEmail: string,
  bookingDetails: {
    consultationType: string;
    date: string;
    time: string;
    hoursUntil: number;
    bookingId: string;
  }
): Promise<string | null> {
  // Deduplicate - don't send if similar reminder sent recently
  const isDuplicate = await wasRecentlySent(
    userEmail,
    "booking",
    "Upcoming Consultation",
    60 // 60 minutes
  );

  if (isDuplicate) {
    return null;
  }

  const notification = await createNotification({
    userEmail,
    type: "booking",
    title: "Upcoming Consultation",
    message: `Your ${bookingDetails.consultationType} is in ${bookingDetails.hoursUntil} hours on ${bookingDetails.date} at ${bookingDetails.time}.`,
    actionUrl: "/client-portal",
    metadata: {
      bookingId: bookingDetails.bookingId,
      hoursUntil: bookingDetails.hoursUntil,
    },
  });

  return notification?.id || null;
}

// ============================================
// DOCUMENT/PURCHASE NOTIFICATIONS
// ============================================

/**
 * Notify user of document purchase
 */
export async function notifyDocumentPurchased(
  userEmail: string,
  purchaseDetails: {
    documentNames: string[];
    total: number;
    purchaseId: string;
  }
): Promise<string | null> {
  const docCount = purchaseDetails.documentNames.length;
  const docList = docCount === 1
    ? purchaseDetails.documentNames[0]
    : `${docCount} documents`;

  const notification = await createNotification({
    userEmail,
    type: "document",
    title: "Purchase Complete",
    message: `You've successfully purchased ${docList}. Access them in your portal.`,
    actionUrl: "/client-portal",
    metadata: {
      purchaseId: purchaseDetails.purchaseId,
      documentNames: purchaseDetails.documentNames,
      total: purchaseDetails.total,
    },
  });

  return notification?.id || null;
}

/**
 * Notify user of payment received
 */
export async function notifyPaymentReceived(
  userEmail: string,
  paymentDetails: {
    amount: number;
    description: string;
    paymentId: string;
  }
): Promise<string | null> {
  const formattedAmount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(paymentDetails.amount / 100);

  const notification = await createNotification({
    userEmail,
    type: "payment",
    title: "Payment Received",
    message: `Payment of ${formattedAmount} for ${paymentDetails.description} has been processed.`,
    actionUrl: "/client-portal",
    metadata: {
      paymentId: paymentDetails.paymentId,
      amount: paymentDetails.amount,
    },
  });

  return notification?.id || null;
}

// ============================================
// GAMIFICATION NOTIFICATIONS
// ============================================

/**
 * Notify user of achievement unlocked
 */
export async function notifyAchievementUnlocked(
  userEmail: string,
  achievement: {
    name: string;
    description: string;
    xpReward: number;
    badge?: string;
    achievementId: string;
  }
): Promise<string | null> {
  const notification = await createNotification({
    userEmail,
    type: "achievement",
    title: `Achievement Unlocked: ${achievement.name}`,
    message: `${achievement.description} You earned ${achievement.xpReward} XP!`,
    actionUrl: "/client-portal",
    metadata: {
      achievementId: achievement.achievementId,
      name: achievement.name,
      xpReward: achievement.xpReward,
      badge: achievement.badge,
    },
  });

  return notification?.id || null;
}

/**
 * Notify user of XP earned
 */
export async function notifyXPEarned(
  userEmail: string,
  xpDetails: {
    amount: number;
    source: string;
    newTotal?: number;
    multiplier?: number;
  }
): Promise<string | null> {
  // Only notify for significant XP gains (50+) to avoid spam
  if (xpDetails.amount < 50) {
    return null;
  }

  // Deduplicate - don't notify if XP earned recently
  const isDuplicate = await wasRecentlySent(
    userEmail,
    "xp",
    "XP Earned",
    2 // 2 minutes
  );

  if (isDuplicate) {
    return null;
  }

  const multiplierText = xpDetails.multiplier && xpDetails.multiplier > 1
    ? ` (${xpDetails.multiplier}x multiplier!)`
    : "";

  const notification = await createNotification({
    userEmail,
    type: "xp",
    title: "XP Earned",
    message: `You earned ${xpDetails.amount} XP from ${xpDetails.source}${multiplierText}`,
    actionUrl: "/client-portal",
    metadata: {
      amount: xpDetails.amount,
      source: xpDetails.source,
      newTotal: xpDetails.newTotal,
      multiplier: xpDetails.multiplier,
    },
  });

  return notification?.id || null;
}

/**
 * Notify user of streak milestone
 */
export async function notifyStreakMilestone(
  userEmail: string,
  streakDetails: {
    days: number;
    xpBonus?: number;
    milestone?: boolean;
  }
): Promise<string | null> {
  // Only notify on milestones (7, 14, 30, 60, 90, 180, 365 days)
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const isMilestone = milestones.includes(streakDetails.days);

  if (!isMilestone && !streakDetails.milestone) {
    return null;
  }

  const bonusText = streakDetails.xpBonus
    ? ` You earned ${streakDetails.xpBonus} bonus XP!`
    : "";

  const notification = await createNotification({
    userEmail,
    type: "streak",
    title: `${streakDetails.days}-Day Streak!`,
    message: `Amazing! You've maintained a ${streakDetails.days}-day streak.${bonusText}`,
    actionUrl: "/client-portal",
    metadata: {
      days: streakDetails.days,
      xpBonus: streakDetails.xpBonus,
    },
  });

  return notification?.id || null;
}

/**
 * Notify user of streak at risk
 */
export async function notifyStreakAtRisk(
  userEmail: string,
  streakDetails: {
    currentStreak: number;
    hoursRemaining: number;
    freezeTokens: number;
  }
): Promise<string | null> {
  // Deduplicate - only send once per day
  const isDuplicate = await wasRecentlySent(
    userEmail,
    "streak",
    "Streak At Risk",
    60 * 12 // 12 hours
  );

  if (isDuplicate) {
    return null;
  }

  const freezeNote = streakDetails.freezeTokens > 0
    ? ` You have ${streakDetails.freezeTokens} freeze token(s) available.`
    : "";

  const notification = await createNotification({
    userEmail,
    type: "streak",
    title: "Streak At Risk!",
    message: `Your ${streakDetails.currentStreak}-day streak expires in ${streakDetails.hoursRemaining} hours!${freezeNote}`,
    actionUrl: "/client-portal",
    metadata: {
      currentStreak: streakDetails.currentStreak,
      hoursRemaining: streakDetails.hoursRemaining,
      freezeTokens: streakDetails.freezeTokens,
    },
  });

  return notification?.id || null;
}

/**
 * Notify user of level up
 */
export async function notifyLevelUp(
  userEmail: string,
  levelDetails: {
    newLevel: number;
    levelName: string;
    xpRequired: number;
    perks?: string[];
  }
): Promise<string | null> {
  const perksText = levelDetails.perks?.length
    ? ` New perks: ${levelDetails.perks.join(", ")}`
    : "";

  const notification = await createNotification({
    userEmail,
    type: "achievement",
    title: `Level Up! You're now ${levelDetails.levelName}`,
    message: `Congratulations! You've reached level ${levelDetails.newLevel}.${perksText}`,
    actionUrl: "/client-portal",
    metadata: {
      newLevel: levelDetails.newLevel,
      levelName: levelDetails.levelName,
      perks: levelDetails.perks,
    },
  });

  return notification?.id || null;
}

// ============================================
// SYSTEM NOTIFICATIONS
// ============================================

/**
 * Send a system notification
 */
export async function notifySystem(
  userEmail: string,
  systemMessage: {
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<string | null> {
  const notification = await createNotification({
    userEmail,
    type: "system",
    title: systemMessage.title,
    message: systemMessage.message,
    actionUrl: systemMessage.actionUrl,
    metadata: systemMessage.metadata,
  });

  return notification?.id || null;
}

/**
 * Notify user of message from lawyer/support
 */
export async function notifyNewMessage(
  userEmail: string,
  messageDetails: {
    from: string;
    preview: string;
    conversationId?: string;
  }
): Promise<string | null> {
  const notification = await createNotification({
    userEmail,
    type: "message",
    title: `New message from ${messageDetails.from}`,
    message: messageDetails.preview.slice(0, 100) + (messageDetails.preview.length > 100 ? "..." : ""),
    actionUrl: messageDetails.conversationId
      ? `/client-portal/discussions?id=${messageDetails.conversationId}`
      : "/client-portal/discussions",
    metadata: {
      from: messageDetails.from,
      conversationId: messageDetails.conversationId,
    },
  });

  return notification?.id || null;
}

// ============================================
// BATCH NOTIFICATIONS
// ============================================

/**
 * Send notification to multiple users
 */
export async function notifyMultipleUsers(
  userEmails: string[],
  notification: {
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of userEmails) {
    const result = await createNotification({
      userEmail: email,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
    });

    if (result) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
