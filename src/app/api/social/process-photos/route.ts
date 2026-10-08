import { NextRequest, NextResponse } from 'next/server'
import { requireEffectiveBusinessContext } from '@/lib/utils/impersonation'
import { processJobPhoto, type Platform, type OverlayStyle } from '@/lib/imageProcessor'

export async function POST(req: NextRequest) {
  const ctx = await requireEffectiveBusinessContext()
  if (!ctx.ok) return ctx.response
  const { businessId, db } = ctx

  const { jobId, photoUrls, platforms, overlayStyle } = await req.json()

  if (!photoUrls?.length || !platforms?.length) {
    return NextResponse.json({ error: 'photoUrls and platforms required' }, { status: 400 })
  }

  const { data: business } = await db
    .from('businesses')
    .select('id, name, brand_color, brand_text_color, logo_url, social_overlay_style, trade_type, suburb, state')
    .eq('id', businessId)
    .single()

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  // Load job geo data
  let suburb = (business as { suburb?: string }).suburb || ''
  let state = (business as { state?: string }).state || ''
  let latitude = 0
  let longitude = 0
  let tradeType = (business as { trade_type?: string }).trade_type || 'Trade'

  if (jobId) {
    const { data: job } = await db
      .from('jobs')
      .select('site_suburb, site_state, site_latitude, site_longitude, trade_type, completed_at')
      .eq('id', jobId)
      .single()
    if (job) {
      suburb = (job as { site_suburb?: string }).site_suburb || suburb
      state = (job as { site_state?: string }).site_state || state
      latitude = (job as { site_latitude?: number }).site_latitude || latitude
      longitude = (job as { site_longitude?: number }).site_longitude || longitude
      tradeType = (job as { trade_type?: string }).trade_type || tradeType
    }
  }

  const style: OverlayStyle = overlayStyle || (business as { social_overlay_style?: string }).social_overlay_style || 'bottom_bar'
  const brandColor = (business as { brand_color?: string }).brand_color || '#FFD700'
  const brandTextColor = (business as { brand_text_color?: string }).brand_text_color || '#0A0A0A'
  const logoUrl = business.logo_url

  const processedPhotoUrls: Record<string, string[]> = {}
  const platformMap: Platform[] = platforms as Platform[]

  let processed = 0
  const total = photoUrls.length * platformMap.length

  for (const platform of platformMap) {
    processedPhotoUrls[platform] = []
    for (const imageUrl of photoUrls) {
      try {
        const result = await processJobPhoto({
          imageUrl,
          businessName: business.name || 'Business',
          suburb,
          state,
          tradeType,
          latitude,
          longitude,
          completedAt: new Date(),
          brandColor,
          brandTextColor,
          logoUrl,
          overlayStyle: style,
          platform,
          businessId,
          jobId: jobId || 'standalone',
        })
        processedPhotoUrls[platform].push(result.processedUrl)
      } catch (err) {
        console.error(`[ProcessPhotos] Failed ${platform}/${imageUrl}:`, err)
        processedPhotoUrls[platform].push('') // placeholder for failed
      }
      processed++
      console.log(`[ProcessPhotos] ${processed}/${total} complete`)
    }
  }

  return NextResponse.json({ processedPhotoUrls, total, processed })
}
