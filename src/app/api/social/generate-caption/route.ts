import { NextRequest, NextResponse } from 'next/server'
import { requirePaidBusinessAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { generateSocialCaption, type BrandVoice, type SocialPlatform } from '@/lib/socialAI'
import { DEFAULT_BUSINESS_TYPE } from '@/lib/socialHost/hostBusinessProfile'
import {
  DEFAULT_POST_SUBTYPE_ID,
  getPostSubtypeDefinition,
  isPostSubtypeId,
} from '@/lib/social/postTaxonomy'
import {
  designedMetaFromContent,
  type DesignedCaptionJob,
} from '@/lib/social/designedCaptionContext'
import { generateDesignedCaption } from '@/lib/social/generateDesignedCaption'
import { loadSafeCaptionJob } from '@/lib/social/mediaAssetJob'
import { generateVideoCaption } from '@/lib/social/generateVideoCaption'
import { VIDEO_CAPTION_USES_RENDER_CREDITS } from '@/lib/social/videoCaptionContext'
import { consumeAiCredits, refundAiCredits } from '@/lib/billing/consumeAiCredits'
import { createServiceClient } from '@/lib/supabase/server'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  let captionRefund: { businessId: string; actionId: string } | null = null
  try {
    const ctx = await requirePaidBusinessAccess()
    if (!ctx.ok) return ctx.response
    const { user, businessId, db } = ctx

    const body = await req.json()
    const { jobId, platform, brandVoice, postSubtype, quoteText, customerName, renderId, assetId } =
      body
    console.log('[GenerateCaption] Request:', {
      jobId,
      renderId: typeof renderId === 'string' ? renderId : null,
      assetId: typeof assetId === 'string' ? assetId : null,
      platform,
      brandVoice,
      postSubtype,
      hasQuoteText: Boolean(quoteText?.trim()),
      userId: user.id,
    })

    const { data: business, error: bizErr } = await db
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (bizErr || !business) {
      console.error('[GenerateCaption] Business fetch failed:', { bizErr, businessId })
      return NextResponse.json({ error: 'Business not found', detail: bizErr?.message }, { status: 404 })
    }

    console.log('[GenerateCaption] Business loaded:', business.name)

    const captionCredit = await consumeAiCredits(db, {
      businessId,
      feature: 'social_caption',
      actionId: `social-caption:${user.id}:${crypto.randomUUID()}`,
      sourceType: 'social_caption',
      sourceId: typeof assetId === 'string' ? assetId : typeof renderId === 'string' ? renderId : jobId,
    })
    captionRefund = { businessId, actionId: captionCredit.actionId }

    if (typeof assetId === 'string' && UUID_RE.test(assetId.trim())) {
      const { data: assetRow, error: assetErr } = await db
        .from('social_media_assets')
        .select('id, about_text, job_id, status, media_type')
        .eq('id', assetId.trim())
        .eq('business_id', businessId)
        .maybeSingle()

      if (assetErr) {
        console.error('[GenerateCaption] Video asset fetch failed', assetErr.message)
        return NextResponse.json({ error: 'Could not load video asset' }, { status: 500 })
      }
      if (!assetRow || assetRow.media_type !== 'video') {
        return NextResponse.json({ error: 'Video asset not found' }, { status: 404 })
      }
      if (assetRow.status !== 'ready') {
        return NextResponse.json({ error: 'Video is not ready for captioning' }, { status: 409 })
      }

      const job = await loadSafeCaptionJob(db, businessId, assetRow.job_id)
      const aboutText =
        typeof assetRow.about_text === 'string' ? assetRow.about_text.trim() || null : null

      const caption = await generateVideoCaption({
        businessId,
        aboutText,
        business: {
          name: business.name || 'Our Business',
          services:
            typeof business.ai_agent_services === 'string'
              ? business.ai_agent_services
              : null,
          suburb: typeof business.suburb === 'string' ? business.suburb : null,
          brandVoice:
            typeof business.social_brand_voice === 'string'
              ? business.social_brand_voice
              : null,
          cta:
            typeof business.social_default_cta === 'string'
              ? business.social_default_cta
              : null,
          phone: typeof business.phone === 'string' ? business.phone : null,
          website: typeof business.website === 'string' ? business.website : null,
        },
        job,
      })

      console.log('[GenerateCaption] Video caption ready', {
        assetId,
        usesRenderCredits: VIDEO_CAPTION_USES_RENDER_CREDITS,
        hasAboutText: Boolean(aboutText),
        hasJob: Boolean(job),
      })
      return NextResponse.json({ captions: [caption], source: 'video_library' })
    }

    let renderContent: unknown = null
    let renderJobId: string | null = null
    if (typeof renderId === 'string' && UUID_RE.test(renderId.trim())) {
      const { data: renderRow, error: renderErr } = await db
        .from('hybrid_social_renders')
        .select('id, content, job_id')
        .eq('id', renderId.trim())
        .eq('business_id', businessId)
        .maybeSingle()
      if (renderErr) {
        console.warn('[GenerateCaption] Render fetch error (non-fatal):', renderErr.message)
      }
      if (renderRow) {
        renderContent = renderRow.content
        renderJobId =
          typeof renderRow.job_id === 'string' && renderRow.job_id.trim()
            ? renderRow.job_id.trim()
            : null
      }
    }

    const designed = designedMetaFromContent(renderContent)
    if (designed) {
      const designedJobId = designed.jobId || renderJobId
      let job: DesignedCaptionJob | null = null
      if (designedJobId) {
        const { data: jobData, error: jobErr } = await db
          .from('jobs')
          .select('title, notes, site_suburb, site_state')
          .eq('id', designedJobId)
          .eq('business_id', businessId)
          .maybeSingle()
        if (jobErr) console.warn('[GenerateCaption] Designed job fetch error (non-fatal):', jobErr.message)
        if (jobData) {
          job = {
            title: typeof jobData.title === 'string' ? jobData.title : null,
            description: typeof jobData.notes === 'string' ? jobData.notes : null,
            suburb: typeof jobData.site_suburb === 'string' ? jobData.site_suburb : null,
            state: typeof jobData.site_state === 'string' ? jobData.site_state : null,
          }
        }
      }

      const caption = await generateDesignedCaption({
        businessId,
        designed,
        business: {
          name: business.name || 'Our Business',
          services: typeof business.ai_agent_services === 'string' ? business.ai_agent_services : null,
          suburb: typeof business.suburb === 'string' ? business.suburb : null,
          brandVoice: typeof business.social_brand_voice === 'string' ? business.social_brand_voice : null,
          cta: typeof business.social_default_cta === 'string' ? business.social_default_cta : null,
          phone: typeof business.phone === 'string' ? business.phone : null,
          website: typeof business.website === 'string' ? business.website : null,
        },
        job,
      })
      console.log('[GenerateCaption] Designed caption ready', { renderId, hasBrief: Boolean(designed.userBrief) })
      return NextResponse.json({ captions: [caption], source: 'ai_designed' })
    }

    const subtypeRaw = (postSubtype?.trim() || DEFAULT_POST_SUBTYPE_ID) as string
    if (!isPostSubtypeId(subtypeRaw)) {
      return NextResponse.json({ error: 'Invalid postSubtype' }, { status: 400 })
    }
    const subtype = subtypeRaw
    const occasion = getPostSubtypeDefinition(subtype)

    const resolvedJobId =
      (typeof jobId === 'string' && jobId.trim()) || renderJobId || ''

    let job: { title?: string; description?: string; notes?: string; site_suburb?: string; site_state?: string } = {}
    if (resolvedJobId) {
      const { data: jobData, error: jobErr } = await db
        .from('jobs')
        .select('title, description, notes, site_suburb, site_state')
        .eq('id', resolvedJobId)
        .eq('business_id', businessId)
        .single()
      if (jobErr) console.warn('[GenerateCaption] Job fetch error (non-fatal):', jobErr.message)
      if (jobData) job = jobData
    }

    const jobTitleFallback =
      occasion.descriptionFallback?.trim() || occasion.label

    const captions = await generateSocialCaption({
      businessId,
      businessName: business.name || 'Our Business',
      tradeType: business.business_type || DEFAULT_BUSINESS_TYPE,
      jobTitle: job.title?.trim() || jobTitleFallback,
      jobDescription: [job.description, job.notes].filter(Boolean).join('\n'),
      suburb: job.site_suburb || business.suburb || 'your area',
      state: job.site_state || business.state || 'Australia',
      platform: (platform || 'instagram') as SocialPlatform,
      brandVoice: ((brandVoice || business.social_brand_voice) as BrandVoice) || 'professional',
      cta: business.social_default_cta || 'Order online',
      phone: business.phone || '',
      defaultHashtags: business.social_hashtag_template || '',
      photoCount: 1,
      postSubtype: subtype,
      quoteText: typeof quoteText === 'string' ? quoteText.trim() : undefined,
      customerName: typeof customerName === 'string' ? customerName.trim() : undefined,
    })

    console.log('[GenerateCaption] Generated', captions.length, 'captions')
    return NextResponse.json({ captions, source: 'legacy' })
  } catch (err) {
    if (captionRefund) {
      await refundAiCredits(await createServiceClient(), captionRefund)
    }
    console.error('[GenerateCaption] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Caption generation failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
