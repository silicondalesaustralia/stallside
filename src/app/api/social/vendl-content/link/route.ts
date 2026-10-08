import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHostSession } from '@/lib/socialHost/hostSession'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { parseVendlContentRef } from '@/lib/socialHost/vendlContentTypes'
import { loadVendlContentDetail } from '@/lib/socialHost/vendlContentDetail'
import { linkVendlContentToJob } from '@/lib/socialHost/linkVendlContent'

/** Link a Vendl item to the post: returns the social job id the composer passes around. */
export async function POST(req: NextRequest) {
  try {
    const session = await getHostSession()
    const ctx = await requireEffectiveBusinessContext()
    if (!session || !ctx.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json().catch(() => null)
    const ref = parseVendlContentRef(
      body && typeof body === 'object' ? (body as { ref?: unknown }).ref : null,
    )
    if (!ref) return NextResponse.json({ error: 'Invalid item' }, { status: 400 })

    const standId = session.accountId
    const [detail, stand] = await Promise.all([
      loadVendlContentDetail(standId, ref),
      prisma.stand.findUnique({ where: { id: standId }, select: { locationLabel: true } }),
    ])
    if (!detail) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    const jobId = await linkVendlContentToJob({
      db: ctx.db,
      businessId: ctx.businessId,
      externalRef: `${ref.source}:${ref.id}`,
      detail,
      locationLabel: stand?.locationLabel ?? null,
    })
    return NextResponse.json({ jobId, title: detail.title, kind: detail.kind })
  } catch (err) {
    console.error('[social/vendl-content/link]', err)
    return NextResponse.json({ error: 'Could not link that item.' }, { status: 500 })
  }
}
