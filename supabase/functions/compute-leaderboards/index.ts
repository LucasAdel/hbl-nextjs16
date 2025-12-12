/**
 * Edge Function: Compute Leaderboards
 *
 * Scheduled to run:
 * - Daily at midnight AEST for daily leaderboard
 * - Every Monday at midnight for weekly leaderboard
 * - First of month for monthly leaderboard
 *
 * Computes rankings, detects near-misses, and creates notifications
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserXP {
  user_id: string
  total_xp: number
  period_xp: number
  display_name: string
  avatar_url: string | null
  level: number
  streak_days: number
  achievements_count: number
  show_on_leaderboard: boolean
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

    const { period_type = 'daily' } = await req.json().catch(() => ({}))

    // Calculate period dates
    const now = new Date()
    let periodStart: Date
    let periodEnd: Date

    switch (period_type) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        const dayOfWeek = now.getDay()
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        periodStart.setHours(0, 0, 0, 0)
        periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        break
      default:
        periodStart = new Date(0)
        periodEnd = now
    }

    // Get XP totals for period with privacy settings
    const { data: users, error: usersError } = await supabase
      .rpc('get_leaderboard_data', {
        p_period_start: periodStart.toISOString(),
        p_period_end: periodEnd.toISOString()
      })

    if (usersError) throw usersError

    // Get previous rankings for this period type
    const { data: previousRankings } = await supabase
      .from('leaderboard_snapshots')
      .select('user_id, rank')
      .eq('period_type', period_type)
      .order('computed_at', { ascending: false })
      .limit(1000)

    const previousRankMap = new Map(
      (previousRankings || []).map((r: { user_id: string; rank: number }) => [r.user_id, r.rank])
    )

    // Delete old snapshots for this period
    await supabase
      .from('leaderboard_snapshots')
      .delete()
      .eq('period_type', period_type)
      .eq('period_start', periodStart.toISOString().split('T')[0])

    // Insert new rankings
    const rankings = (users || [])
      .filter((u: UserXP) => u.show_on_leaderboard)
      .sort((a: UserXP, b: UserXP) => b.period_xp - a.period_xp)
      .map((user: UserXP, index: number) => ({
        period_type,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        user_id: user.user_id,
        rank: index + 1,
        previous_rank: previousRankMap.get(user.user_id) || null,
        xp_total: user.total_xp,
        xp_earned_in_period: user.period_xp,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        level: user.level,
        streak_days: user.streak_days,
        achievements_count: user.achievements_count,
        is_visible: true
      }))

    if (rankings.length > 0) {
      const { error: insertError } = await supabase
        .from('leaderboard_snapshots')
        .insert(rankings)

      if (insertError) throw insertError
    }

    // Detect near-misses and create notifications
    const nearMissThreshold = 10 // Top 10
    for (const ranking of rankings) {
      const previousRank = previousRankMap.get(ranking.user_id)

      // Rank up notification
      if (previousRank && ranking.rank < previousRank) {
        await supabase.rpc('create_gamification_notification', {
          p_user_id: ranking.user_id,
          p_type: 'leaderboard_rank_up',
          p_title: `Rank Up! #${ranking.rank} 🚀`,
          p_message: `You moved up ${previousRank - ranking.rank} positions on the ${period_type} leaderboard!`,
          p_animation_type: 'sparkle',
          p_icon: '📈'
        })
      }

      // Near-miss notification (close to top 10)
      if (ranking.rank > nearMissThreshold && ranking.rank <= nearMissThreshold + 5) {
        const gap = ranking.rank - nearMissThreshold
        await supabase.rpc('create_gamification_notification', {
          p_user_id: ranking.user_id,
          p_type: 'near_miss',
          p_title: `So Close! You're #${ranking.rank}`,
          p_message: `Just ${gap} more position${gap > 1 ? 's' : ''} to reach the Top 10!`,
          p_current_value: ranking.rank,
          p_target_value: nearMissThreshold,
          p_animation_type: 'pulse',
          p_icon: '🎯'
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        period_type,
        rankings_computed: rankings.length,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Leaderboard computation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
