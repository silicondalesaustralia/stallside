/**
 * GET /api/social/ai-designed-config
 * Session-only public boolean for Start from scratch chooser. Does not expose raw env.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'

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
    aiDesignedEnabled: isAiDesignedEnabled(),
  })
}
