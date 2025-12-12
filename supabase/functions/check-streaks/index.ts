/**
 * Edge Function: Check Streaks
 *
 * Scheduled to run daily at midnight AEST
 *
 * Checks for:
 * - Broken streaks (no activity yesterday)
 * - At-risk streaks (activity yesterday but not today)
 * - Streak milestones (7, 14, 30, 60, 90 days)
 * - Auto-freeze token usage
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365]

interface UserStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_date: string
  streak_freeze_count: number
}

interface FreezeTokens {
  user_id: string
  tokens_available: number
  auto_use_enabled: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(today.getTime() - 48 * 60 * 60 * 1000)

    // Get all users with active streaks
    const { data: usersWithStreaks, error: streaksError } = await supabase
      .from('user_profiles')
      .select('user_id, current_streak, longest_streak, last_active_date, streak_freeze_count')
      .gt('current_streak', 0)

    if (streaksError) throw streaksError

    let streaksBroken = 0
    let streaksFrozen = 0
    let streaksAtRisk = 0
    let milestonesReached = 0

    for (const user of (usersWithStreaks || []) as UserStreak[]) {
      const lastActive = new Date(user.last_active_date)
      lastActive.setHours(0, 0, 0, 0)

      // Check if user was active yesterday
      const wasActiveYesterday = lastActive.getTime() === yesterday.getTime()
      const wasActiveTwoDaysAgo = lastActive.getTime() === twoDaysAgo.getTime()

      // If not active yesterday, streak is at risk or broken
      if (!wasActiveYesterday && lastActive.getTime() < yesterday.getTime()) {
        // Get freeze tokens
        const { data: freezeTokens } = await supabase
          .from('streak_freeze_tokens')
          .select('tokens_available, auto_use_enabled')
          .eq('user_id', user.user_id)
          .single()

        const tokens = freezeTokens as FreezeTokens | null

        // Check if we can auto-freeze
        if (tokens?.auto_use_enabled && tokens?.tokens_available > 0) {
          // Use freeze token
          await supabase.rpc('use_streak_freeze', { p_user_id: user.user_id })

          // Log streak frozen event
          await supabase.from('streak_events').insert({
            user_id: user.user_id,
            event_type: 'streak_frozen',
            streak_day: user.current_streak,
            freeze_reason: 'Auto-freeze activated due to inactivity'
          })

          // Create notification
          await supabase.rpc('create_gamification_notification', {
            p_user_id: user.user_id,
            p_type: 'streak_frozen',
            p_title: 'Streak Saved! ❄️',
            p_message: `Your ${user.current_streak}-day streak was protected by a freeze token.`,
            p_animation_type: 'glow',
            p_icon: '❄️'
          })

          streaksFrozen++
        } else if (wasActiveTwoDaysAgo) {
          // Was active 2 days ago but not yesterday - streak at risk
          await supabase.rpc('create_gamification_notification', {
            p_user_id: user.user_id,
            p_type: 'streak_at_risk',
            p_title: `⚠️ ${user.current_streak}-Day Streak at Risk!`,
            p_message: "You haven't been active today. Don't lose your streak!",
            p_animation_type: 'shake',
            p_icon: '⚠️',
            p_current_value: user.current_streak,
            p_target_value: user.current_streak + 1
          })

          streaksAtRisk++
        } else {
          // Streak is broken
          await supabase
            .from('user_profiles')
            .update({
              current_streak: 0,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.user_id)

          // Log streak broken event
          await supabase.from('streak_events').insert({
            user_id: user.user_id,
            event_type: 'streak_broken',
            streak_day: user.current_streak,
            freeze_reason: 'No activity and no freeze tokens available'
          })

          // Create notification
          await supabase.rpc('create_gamification_notification', {
            p_user_id: user.user_id,
            p_type: 'streak_broken',
            p_title: 'Streak Lost 💔',
            p_message: `Your ${user.current_streak}-day streak has ended. Start a new one today!`,
            p_animation_type: 'shake',
            p_icon: '💔'
          })

          streaksBroken++
        }
      } else if (wasActiveYesterday) {
        // Check for milestone
        const nextMilestone = STREAK_MILESTONES.find(m => m === user.current_streak)

        if (nextMilestone) {
          // Milestone reached!
          await supabase.from('streak_events').insert({
            user_id: user.user_id,
            event_type: 'streak_milestone',
            streak_day: user.current_streak
          })

          // Award freeze token for major milestones
          if ([30, 60, 90, 180, 365].includes(nextMilestone)) {
            await supabase.rpc('award_streak_freeze_token', {
              p_user_id: user.user_id,
              p_reason: `${nextMilestone}-day streak milestone reward`
            })
          }

          // Create milestone notification
          const xpBonus = nextMilestone * 10
          await supabase.rpc('create_gamification_notification', {
            p_user_id: user.user_id,
            p_type: 'streak_milestone',
            p_title: `🔥 ${nextMilestone}-Day Streak!`,
            p_message: `Amazing! You've maintained a ${nextMilestone}-day streak!`,
            p_xp_amount: xpBonus,
            p_reward_tier: nextMilestone >= 30 ? 'rare' : 'bonus',
            p_animation_type: 'fireworks',
            p_icon: '🔥'
          })

          milestonesReached++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: usersWithStreaks?.length || 0,
        streaks_broken: streaksBroken,
        streaks_frozen: streaksFrozen,
        streaks_at_risk: streaksAtRisk,
        milestones_reached: milestonesReached
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Streak check error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
