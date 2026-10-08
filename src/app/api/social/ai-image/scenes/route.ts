import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

import type { AiImageSceneOption } from '@/lib/social/aiImageStyles'

export type { AiImageSceneOption }

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('ai_image_scene_options')
    .select('id, purpose, scene_label, scene_prompt_fragment, sort_order')
    .order('purpose', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[AiImage/scenes]', error.message)
    return NextResponse.json({ error: 'Failed to load scene options' }, { status: 500 })
  }

  return NextResponse.json({ scenes: data ?? [] })
}
