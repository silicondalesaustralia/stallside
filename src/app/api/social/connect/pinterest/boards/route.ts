import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { getPinterestAccessToken } from '@/lib/social/pinterest/pinterestAuth'
import { listPinterestBoards, type PinterestBoard } from '@/lib/social/pinterest/pinterestApi'

const DEMO_BOARDS: PinterestBoard[] = [
  { id: 'demo-board-produce', name: 'Fresh from the farm', privacy: 'PUBLIC' },
  { id: 'demo-board-recipes', name: 'Recipes', privacy: 'PUBLIC' },
]

/** Boards the connected Pinterest account can Pin to (Create → Pinterest settings). */
export async function GET() {
  try {
    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) return ctx.response
    if (process.env.SOCIAL_DEMO_MODE === 'true') return NextResponse.json({ boards: DEMO_BOARDS })

    const accessToken = await getPinterestAccessToken(ctx.businessId)
    if (!accessToken) {
      return NextResponse.json({ error: 'Pinterest is not connected' }, { status: 409 })
    }
    const boards = await listPinterestBoards(accessToken)
    return NextResponse.json({ boards })
  } catch (err) {
    console.error('[Pinterest boards]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not load Pinterest boards' },
      { status: 502 },
    )
  }
}
