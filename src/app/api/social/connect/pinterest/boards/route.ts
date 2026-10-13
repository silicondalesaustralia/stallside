import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHostSession } from '@/lib/socialHost/hostSession'
import { standShopUrl } from '@/lib/socialHost/standPublicUrls'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { getPinterestAccessToken } from '@/lib/social/pinterest/pinterestAuth'
import { listPinterestBoards, type PinterestBoard } from '@/lib/social/pinterest/pinterestApi'

const DEMO_BOARDS: PinterestBoard[] = [
  { id: 'demo-board-produce', name: 'Fresh from the farm', privacy: 'PUBLIC' },
  { id: 'demo-board-recipes', name: 'Recipes', privacy: 'PUBLIC' },
]

/** Default Pin link when no product / pre-order page is linked; null if the stand can't be resolved. */
async function loadShopUrl(): Promise<string | null> {
  try {
    const session = await getHostSession()
    if (!session) return null
    const stand = await prisma.stand.findUnique({ where: { id: session.accountId }, select: { slug: true } })
    return stand ? standShopUrl(stand.slug) : null
  } catch (err) {
    console.error('[Pinterest boards] Shop URL lookup failed', err)
    return null
  }
}

/** Boards the connected Pinterest account can Pin to (Create → Pinterest settings). */
export async function GET() {
  try {
    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) return ctx.response
    const shopUrl = await loadShopUrl()
    if (process.env.SOCIAL_DEMO_MODE === 'true') return NextResponse.json({ boards: DEMO_BOARDS, shopUrl })

    const accessToken = await getPinterestAccessToken(ctx.businessId)
    if (!accessToken) {
      return NextResponse.json({ error: 'Pinterest is not connected' }, { status: 409 })
    }
    const boards = await listPinterestBoards(accessToken)
    return NextResponse.json({ boards, shopUrl })
  } catch (err) {
    console.error('[Pinterest boards]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not load Pinterest boards' },
      { status: 502 },
    )
  }
}
