// POST /api/social/orshot-webhook
//
// Receives template create/update notifications from Orshot Studio Embed
// (configure the webhook URL in Orshot Embed settings).
// Logs payloads for later thumbnail invalidation / audit.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function inferEventType(payload: Record<string, unknown>): string {
  const candidates = [
    payload.event,
    payload.type,
    payload.action,
    payload.event_type,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  if (payload.templateId != null || payload.template_id != null) return 'template_change'
  return 'orshot_embed'
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown> = {}

  try {
    const text = await request.text()
    if (text.trim()) {
      payload = JSON.parse(text) as Record<string, unknown>
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const eventType = inferEventType(payload)
  const templateId =
    payload.templateId ??
    payload.template_id ??
    payload.id ??
    null

  console.log('[OrshotWebhook]', {
    eventType,
    templateId,
    keys: Object.keys(payload),
  })

  try {
    const db = await createServiceClient()
    await db.from('webhook_logs').insert({
      source:     'orshot',
      event_type: String(eventType),
      status:     'success',
      payload:    {
        ...payload,
        _received_at: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[OrshotWebhook] Failed to log event', err)
    return NextResponse.json({ error: 'Failed to persist webhook' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
