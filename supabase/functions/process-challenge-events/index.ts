/**
 * Edge Function: Process Challenge Events
 *
 * Triggered by analytics events to check challenge progress
 *
 * When an analytics event is tracked, this function checks if it
 * matches any active challenge requirements and updates progress
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsEvent {
  event_name: string
  event_category: string
  user_id: string | null
  session_id: string
  properties: Record<string, unknown>
}

interface Challenge {
  id: string
  title: string
  requirements: {
    event_name?: string
    event_category?: string
    count?: number
    property_match?: Record<string, unknown>
  }
  xp_reward: number
}

interface ChallengeProgress {
  id: string
  challenge_id: string
  progress: number
  target: number
  status: string
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

    const { event } = await req.json() as { event: AnalyticsEvent }

    if (!event || !event.user_id) {
      return new Response(
        JSON.stringify({ success: true, message: 'No user_id, skipping challenge check' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's active challenges
    const { data: activeProgress, error: progressError } = await supabase
      .from('user_challenge_progress')
      .select(`
        id,
        challenge_id,
        progress,
        target,
        status,
        challenges (
          id,
          title,
          requirements,
          xp_reward
        )
      `)
      .eq('user_id', event.user_id)
      .eq('status', 'in_progress')

    if (progressError) throw progressError

    const updatedChallenges: string[] = []

    for (const progressItem of (activeProgress || []) as (ChallengeProgress & { challenges: Challenge })[]) {
      const challenge = progressItem.challenges
      if (!challenge?.requirements) continue

      const req = challenge.requirements

      // Check if event matches challenge requirements
      let matches = false

      if (req.event_name && req.event_name === event.event_name) {
        matches = true
      }

      if (req.event_category && req.event_category === event.event_category) {
        matches = true
      }

      // Check property matching if specified
      if (matches && req.property_match) {
        for (const [key, value] of Object.entries(req.property_match)) {
          if (event.properties[key] !== value) {
            matches = false
            break
          }
        }
      }

      if (matches) {
        // Update challenge progress
        const result = await supabase.rpc('update_challenge_progress', {
          p_user_id: event.user_id,
          p_challenge_id: challenge.id,
          p_increment: 1
        })

        if (result.data) {
          updatedChallenges.push(challenge.id)
        }
      }
    }

    // Also check for challenges user isn't enrolled in but qualifies for (auto-enrol)
    const { data: availableChallenges } = await supabase
      .from('challenges')
      .select('id, title, requirements, type')
      .eq('is_active', true)
      .in('type', ['daily', 'weekly', 'onboarding'])

    for (const challenge of (availableChallenges || []) as Challenge[]) {
      // Check if already enrolled
      const isEnrolled = activeProgress?.some(p => p.challenge_id === challenge.id)
      if (isEnrolled) continue

      // Check if event would match this challenge
      const req = challenge.requirements
      if (req.event_name === event.event_name || req.event_category === event.event_category) {
        // Auto-enrol user in this challenge
        await supabase.rpc('enrol_in_challenge', {
          p_user_id: event.user_id,
          p_challenge_id: challenge.id
        })

        // Then update progress
        await supabase.rpc('update_challenge_progress', {
          p_user_id: event.user_id,
          p_challenge_id: challenge.id,
          p_increment: 1
        })

        updatedChallenges.push(challenge.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_name: event.event_name,
        challenges_updated: updatedChallenges.length,
        challenge_ids: updatedChallenges
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Challenge event processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
