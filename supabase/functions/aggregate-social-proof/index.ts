/**
 * Edge Function: Aggregate Social Proof
 *
 * Scheduled to run hourly
 *
 * Aggregates event counts for social proof display:
 * - "847 users completed a challenge today"
 * - "23 documents purchased in the last hour"
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventConfig {
  event_name: string
  event_type: string
  action_verb: string
  message_template: string
}

const EVENT_CONFIGS: EventConfig[] = [
  {
    event_name: 'purchase_complete',
    event_type: 'purchase',
    action_verb: 'purchased a document',
    message_template: '{count} professionals purchased documents {period}'
  },
  {
    event_name: 'consultation_booked',
    event_type: 'consultation_booked',
    action_verb: 'booked a consultation',
    message_template: '{count} consultations booked {period}'
  },
  {
    event_name: 'article_completed',
    event_type: 'article_read',
    action_verb: 'completed reading an article',
    message_template: '{count} articles read {period}'
  },
  {
    event_name: 'user_identified',
    event_type: 'signup',
    action_verb: 'joined the platform',
    message_template: '{count} professionals joined {period}'
  },
  {
    event_name: 'challenge_complete',
    event_type: 'challenge_complete',
    action_verb: 'completed a challenge',
    message_template: '{count} challenges completed {period}'
  },
  {
    event_name: 'achievement_unlocked',
    event_type: 'achievement_unlock',
    action_verb: 'earned an achievement',
    message_template: '{count} achievements earned {period}'
  }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const results: { event_type: string; period: string; count: number }[] = []

    for (const config of EVENT_CONFIGS) {
      // Hourly aggregate
      const { count: hourlyCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', config.event_name)
        .gte('timestamp', hourAgo.toISOString())

      if (hourlyCount && hourlyCount > 0) {
        await supabase.from('social_proof_aggregates').upsert({
          event_type: config.event_type,
          period_type: 'hourly',
          period_start: hourAgo.toISOString(),
          event_count: hourlyCount,
          message_template: config.message_template,
          action_verb: config.action_verb,
          computed_at: now.toISOString()
        }, {
          onConflict: 'event_type,period_type,period_start'
        })

        results.push({ event_type: config.event_type, period: 'hourly', count: hourlyCount })
      }

      // Daily aggregate
      const { count: dailyCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', config.event_name)
        .gte('timestamp', dayStart.toISOString())

      if (dailyCount && dailyCount > 0) {
        await supabase.from('social_proof_aggregates').upsert({
          event_type: config.event_type,
          period_type: 'daily',
          period_start: dayStart.toISOString(),
          event_count: dailyCount,
          message_template: config.message_template,
          action_verb: config.action_verb,
          computed_at: now.toISOString()
        }, {
          onConflict: 'event_type,period_type,period_start'
        })

        results.push({ event_type: config.event_type, period: 'daily', count: dailyCount })
      }

      // Weekly aggregate
      const { count: weeklyCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', config.event_name)
        .gte('timestamp', weekAgo.toISOString())

      if (weeklyCount && weeklyCount > 0) {
        await supabase.from('social_proof_aggregates').upsert({
          event_type: config.event_type,
          period_type: 'weekly',
          period_start: weekAgo.toISOString(),
          event_count: weeklyCount,
          message_template: config.message_template,
          action_verb: config.action_verb,
          computed_at: now.toISOString()
        }, {
          onConflict: 'event_type,period_type,period_start'
        })

        results.push({ event_type: config.event_type, period: 'weekly', count: weeklyCount })
      }
    }

    // Get unique user counts for "X professionals" messaging
    const { count: dailyActiveUsers } = await supabase
      .from('analytics_events')
      .select('session_id', { count: 'exact', head: true })
      .gte('timestamp', dayStart.toISOString())

    return new Response(
      JSON.stringify({
        success: true,
        aggregates_updated: results.length,
        results,
        daily_active_users: dailyActiveUsers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Social proof aggregation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
