"use client";

import { useEffect, useState } from "react";
import { GamificationWidget } from "./gamification-widget";
import { StreakProtection, useStreakProtection } from "./gamification/StreakProtection";

// Gets user email from cookie or session storage
export function GamificationWidgetWrapper() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check for user email in various places
    // 1. Check cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "user_email" && value) {
        setEmail(decodeURIComponent(value));
        return;
      }
    }

    // 2. Check local storage
    const storedEmail = localStorage.getItem("hbl_user_email");
    if (storedEmail) {
      setEmail(storedEmail);
      return;
    }

    // 3. Check session storage
    const sessionEmail = sessionStorage.getItem("hbl_user_email");
    if (sessionEmail) {
      setEmail(sessionEmail);
    }
  }, []);

  // Get streak data for protection component
  const streakData = useStreakProtection(email);

  return (
    <>
      <GamificationWidget email={email} />

      {/* Show streak protection warning when at risk */}
      {email && streakData && streakData.isAtRisk && streakData.currentStreak >= 3 && (
        <StreakProtection
          currentStreak={streakData.currentStreak}
          lastActiveDate={streakData.lastActiveDate}
          email={email}
        />
      )}
    </>
  );
}
