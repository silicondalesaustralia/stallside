import { NextRequest, NextResponse } from 'next/server'
import { getHostSession } from '@/lib/socialHost/hostSession'
import { searchVendlContent } from '@/lib/socialHost/vendlContentSearch'

/** Search the selected stand's products, pre-order pages, subscriptions and memberships. */
export async function GET(req: NextRequest) {
  try {
    const session = await getHostSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const q = req.nextUrl.searchParams.get('q') ?? ''
    const items = await searchVendlContent(session.accountId, q)
    return NextResponse.json({ items })
  } catch (err) {
    console.error('[social/vendl-content]', err)
    return NextResponse.json({ error: 'Could not load your products and offers.' }, { status: 500 })
  }
}
