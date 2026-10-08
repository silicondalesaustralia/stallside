import { NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchWeekPlanRecentJobs } from '@/lib/social/weekPlan/recentJobs'

export async function GET() {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const db = await createServiceClient()
  try {
    const jobs = await fetchWeekPlanRecentJobs(db, auth.businessId)
    return NextResponse.json({ jobs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load recent jobs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
