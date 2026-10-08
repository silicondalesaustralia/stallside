/**
 * GET /api/social/recreate-config
 * Session-only public boolean for Recreate UI. Does not expose raw env.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRecreateReferenceImageEnabled } from '@/lib/social/recreateImageConfig'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    referenceRecreateEnabled: isRecreateReferenceImageEnabled(),
  })
}
