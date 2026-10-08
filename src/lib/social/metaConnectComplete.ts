import type { MetaPage } from '@/lib/socialPlatforms'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function completeMetaPageConnection(
  db: SupabaseClient,
  businessId: string,
  platform: 'facebook' | 'instagram',
  page: MetaPage,
  options?: { linkedFacebookPageId?: string | null },
): Promise<{ ok: true } | { ok: false; error: 'no_instagram_linked' | 'page_not_found' }> {
  if (platform === 'facebook') {
    const { error } = await db.from('businesses').update({
      facebook_page_id:      page.id,
      facebook_page_name:    page.name,
      facebook_access_token: page.access_token,
    }).eq('id', businessId)

    if (error) throw error
    return { ok: true }
  }

  const linkedPageId = options?.linkedFacebookPageId ?? null
  if (linkedPageId && page.id !== linkedPageId) {
    return { ok: false, error: 'page_not_found' }
  }

  const igAccount = page.instagram_business_account
  if (!igAccount?.id) {
    return { ok: false, error: 'no_instagram_linked' }
  }

  const { error } = await db.from('businesses').update({
    instagram_account_id:  igAccount.id,
    instagram_username:      igAccount.username || null,
    facebook_access_token:   page.access_token,
    ...(linkedPageId
      ? {}
      : {
          facebook_page_id:   page.id,
          facebook_page_name: page.name,
        }),
  }).eq('id', businessId)

  if (error) throw error
  return { ok: true }
}

export function filterPagesForInstagramConnect(
  pages: MetaPage[],
  linkedFacebookPageId: string | null,
): MetaPage[] {
  if (linkedFacebookPageId) {
    const match = pages.find((p) => p.id === linkedFacebookPageId)
    return match ? [match] : []
  }
  return pages.filter((p) => p.instagram_business_account?.id)
}

export function getDemoMetaPages(platform: 'facebook' | 'instagram'): MetaPage[] {
  const pages: MetaPage[] = [
    {
      id:           'demo-page-electrical',
      name:         'Demo Electrical Services',
      access_token: 'demo-token-electrical',
      instagram_business_account: {
        id:       'demo-ig-electrical',
        username: 'demoelectrical',
      },
    },
    {
      id:           'demo-page-plumbing',
      name:         'Demo Plumbing Co',
      access_token: 'demo-token-plumbing',
    },
  ]

  if (platform === 'instagram') {
    return pages.filter((p) => p.instagram_business_account?.id)
  }
  return pages
}
