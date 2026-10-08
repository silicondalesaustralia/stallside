import { NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { isInfographicAiBackgroundEnabled } from '@/lib/social/infographic/infographicAiBackgroundFeature'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'
import { BUSINESS_SELECT_SOCIAL } from '@/lib/supabase/safeBusinessSelect'
import { SOCIAL_POSTS_SELECT } from '@/lib/social/socialPostsSelect'

const SOCIAL_DEFAULTS = {
  social_brand_voice: 'professional',
  social_default_cta: 'Call us for a free quote',
  social_default_platforms: ['instagram', 'facebook'],
  social_overlay_style: 'bottom_bar',
  social_auto_prompt: true,
  social_logo_corner: 'bottom-right',
  social_text_styles: {
    headline:    { fontFamily: 'Inter', fontSize: 42 },
    description: { fontFamily: 'Inter', fontSize: 22 },
    tagline:     { fontFamily: 'Inter', fontSize: 20 },
  },
}

export async function GET() {
  try {
    const ctx = await requireEffectiveBusinessContext()
    if (!ctx.ok) return ctx.response
    const { user, businessId, db } = ctx
    const usingServiceClient = true

    const { data: rawBiz, error: bizErr } = await db
      .from('businesses')
      .select(BUSINESS_SELECT_SOCIAL)
      .eq('id', businessId)
      .single()

    if (bizErr || !rawBiz) {
      console.error('[social/context] Business fetch failed:', {
        error: bizErr,
        businessId,
        usingServiceClient,
        userId: user.id,
      })
      return NextResponse.json({
        error: 'Business not found',
        detail: bizErr?.message ?? 'No rows returned',
        businessId,
        usingServiceClient,
      }, { status: 404 })
    }

    // Merge SOCIAL_DEFAULTS for any optional columns that don't exist yet (pre-migration 025)
    const bizData = {
      facebook_page_id: null,
      facebook_page_name: null,
      instagram_account_id: null,
      instagram_username: null,
      gmb_account_id: null,
      gmb_location_name: null,
      tiktok_open_id: null,
      tiktok_display_name: null,
      ...SOCIAL_DEFAULTS,
      ...(rawBiz as unknown as Record<string, unknown>),
    }

    // Step 3: fetch posts - graceful fallback if social_posts table doesn't exist yet
    let posts: unknown[] = []
    try {
      const { data: postsData, error: postsErr } = await db
        .from('social_posts')
        .select(SOCIAL_POSTS_SELECT)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(100)
      if (postsErr) {
        console.warn('[social/context] social_posts query error (migration 025 may not have run):', postsErr.message)
      } else if (postsData) {
        posts = postsData
      }
    } catch (postsEx) {
      console.warn('[social/context] social_posts table missing:', postsEx)
    }

    return NextResponse.json({
      business: bizData,
      posts,
      features: {
        infographicAiBackground: isInfographicAiBackgroundEnabled(),
        aiDesignedEnabled: isAiDesignedEnabled(),
      },
    })
  } catch (err) {
    console.error('[social/context] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Server error', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
