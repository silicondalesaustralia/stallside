import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { signJobPhotoRecords } from '@/lib/storage/jobPhotos'

interface Params {
  params: Promise<{ jobId: string }>
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { jobId } = await params

    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) return ctx.response
    const { businessId, db } = ctx

    const { data: job } = await db
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('business_id', businessId)
      .maybeSingle()

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const { data: photos, error } = await db
      .from('job_photos')
      .select('id, url, webp_url')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const signed = await signJobPhotoRecords(db, photos || [])
    return NextResponse.json({ photos: signed })
  } catch (err) {
    console.error('[social/jobs/photos]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
