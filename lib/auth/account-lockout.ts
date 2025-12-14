/**
 * Account Lockout Protection
 *
 * Prevents brute force attacks by locking accounts after failed login attempts.
 * - 5 failed attempts = 15 minute lockout
 * - Exponential backoff for repeat offenders
 */

import { Redis } from "@upstash/redis";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window for counting attempts

// Lazy initialization to handle missing env vars gracefully
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Redis not configured - account lockout disabled");
    return null;
  }

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return redis;
}

/**
 * Get the Redis key for login attempts
 */
function getAttemptsKey(email: string): string {
  return `login_attempts:${email.toLowerCase()}`;
}

/**
 * Get the Redis key for lockout status
 */
function getLockoutKey(email: string): string {
  return `account_locked:${email.toLowerCase()}`;
}

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(email: string): Promise<{
  locked: boolean;
  remainingMs?: number;
  message?: string;
}> {
  const client = getRedis();
  if (!client) {
    return { locked: false };
  }

  try {
    const lockoutData = await client.get<{ lockedAt: number; duration: number }>(
      getLockoutKey(email)
    );

    if (!lockoutData) {
      return { locked: false };
    }

    const elapsed = Date.now() - lockoutData.lockedAt;
    const remaining = lockoutData.duration - elapsed;

    if (remaining <= 0) {
      // Lockout expired, clean up
      await client.del(getLockoutKey(email));
      return { locked: false };
    }

    return {
      locked: true,
      remainingMs: remaining,
      message: `Account locked. Try again in ${Math.ceil(remaining / 60000)} minutes.`,
    };
  } catch (error) {
    console.error("Error checking account lockout:", error);
    return { locked: false };
  }
}

/**
 * Record a failed login attempt
 * Returns lockout status after recording
 */
export async function recordFailedAttempt(email: string): Promise<{
  locked: boolean;
  attempts: number;
  remainingAttempts: number;
  message?: string;
}> {
  const client = getRedis();
  if (!client) {
    return { locked: false, attempts: 0, remainingAttempts: MAX_ATTEMPTS };
  }

  try {
    const attemptsKey = getAttemptsKey(email);

    // Increment attempts
    const attempts = await client.incr(attemptsKey);

    // Set expiry on first attempt
    if (attempts === 1) {
      await client.pexpire(attemptsKey, ATTEMPT_WINDOW_MS);
    }

    // Check if we need to lock the account
    if (attempts >= MAX_ATTEMPTS) {
      // Calculate lockout duration with exponential backoff
      // 15 min for first lockout, 30 min for second, 60 min for third, etc.
      const lockoutMultiplier = Math.min(Math.floor(attempts / MAX_ATTEMPTS), 4);
      const duration = LOCKOUT_DURATION_MS * Math.pow(2, lockoutMultiplier - 1);

      await client.set(
        getLockoutKey(email),
        { lockedAt: Date.now(), duration },
        { px: duration }
      );

      // Reset attempts counter
      await client.del(attemptsKey);

      return {
        locked: true,
        attempts,
        remainingAttempts: 0,
        message: `Too many failed attempts. Account locked for ${Math.ceil(duration / 60000)} minutes.`,
      };
    }

    return {
      locked: false,
      attempts,
      remainingAttempts: MAX_ATTEMPTS - attempts,
      message: `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempts remaining.`,
    };
  } catch (error) {
    console.error("Error recording failed attempt:", error);
    return { locked: false, attempts: 0, remainingAttempts: MAX_ATTEMPTS };
  }
}

/**
 * Clear login attempts after successful login
 */
export async function clearLoginAttempts(email: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    await client.del(getAttemptsKey(email));
    await client.del(getLockoutKey(email));
  } catch (error) {
    console.error("Error clearing login attempts:", error);
  }
}

/**
 * Get current attempt count for an email
 */
export async function getAttemptCount(email: string): Promise<number> {
  const client = getRedis();
  if (!client) return 0;

  try {
    const attempts = await client.get<number>(getAttemptsKey(email));
    return attempts || 0;
  } catch (error) {
    console.error("Error getting attempt count:", error);
    return 0;
  }
}
