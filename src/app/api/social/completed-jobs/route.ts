import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'

const COMPLETED_STAGES = ['job_done', 'invoice_sent', 'paid'] as const
const RECENT_STAGES = [
  'new_lead',
  'contacted',
  'quote_sent',
  'quote_accepted',
  'in_progress',
  'job_done',
  'invoice_sent',
  'paid',
] as const

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const scope = req.nextUrl.searchParams.get('scope')?.trim()
    const stages = scope === 'recent' ? RECENT_STAGES : COMPLETED_STAGES

    const { data, error } = await db
      .from('jobs')
      .select('id, title, site_suburb, site_state, stage, created_at, customers(first_name, last_name)')
      .eq('business_id', businessId)
      .in('stage', [...stages])
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = (data || []).map((j: any) => {
      const rawCustomers = j.customers
      const customers = Array.isArray(rawCustomers) ? rawCustomers[0] ?? null : rawCustomers
      return { ...j, customers, photos: [] }
    })

    return NextResponse.json({ jobs })
  } catch (err) {
    console.error('[social/completed-jobs]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
