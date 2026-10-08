'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSocialWorkspaceData } from '@/lib/social/fetchSocialWorkspace'
import type { SocialTextStyles } from '@/lib/social/socialTextStyle'

export interface SocialWorkspacePost {
  id: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed' | 'cancelled'
  publishing_mode?: 'automatic' | 'manual' | null
  caption: string | null
  platforms: string[]
  photo_urls: string[]
  processed_photo_urls: Record<string, string[]> | null
  scheduled_for: string | null
  posted_at: string | null
  posted_manually: boolean | null
  job_suburb: string | null
  job_state: string | null
  trade_type: string | null
  facebook_post_id: string | null
  instagram_post_id: string | null
  gmb_post_id: string | null
  facebook_error: string | null
  instagram_error: string | null
  gmb_error: string | null
  tiktok_post_id?: string | null
  tiktok_error?: string | null
  tiktok_status?: string | null
  created_at: string
}

export interface SocialWorkspaceBusiness {
  id: string
  name: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
  ai_agent_services: string | null
  facebook_page_id: string | null
  facebook_page_name: string | null
  instagram_account_id: string | null
  instagram_username: string | null
  gmb_account_id: string | null
  gmb_location_name: string | null
  tiktok_open_id?: string | null
  tiktok_display_name?: string | null
  tiktok_avatar_url?: string | null
  social_brand_voice: string | null
  social_default_cta: string | null
  social_auto_prompt: boolean | null
  social_text_styles: SocialTextStyles | null
  brand_color: string | null
  social_logo_corner?: string | null
  social_compose_last_category?: string | null
  social_compose_last_subtype?: string | null
  timezone?: string | null
}

export function useSocialWorkspace() {
  const router = useRouter()
  const [business, setBusiness] = useState<SocialWorkspaceBusiness | null>(null)
  const [posts, setPosts] = useState<SocialWorkspacePost[]>([])
  const [infographicAiBackgroundEnabled, setInfographicAiBackgroundEnabled] = useState(false)
  const [aiDesignedEnabled, setAiDesignedEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoadError(null)
    try {
      const result = await fetchSocialWorkspaceData()
      if (result.unauthorized) {
        router.push('/login')
        return
      }
      if (result.error) {
        setLoadError(result.error)
        return
      }
      if (result.business) setBusiness(result.business)
      else setLoadError('API returned no business data')
      setInfographicAiBackgroundEnabled(result.features.infographicAiBackground)
      setAiDesignedEnabled(result.features.aiDesignedEnabled)
      setPosts(result.posts)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return {
    business,
    setBusiness,
    posts,
    setPosts,
    infographicAiBackgroundEnabled,
    aiDesignedEnabled,
    loading,
    loadError,
    loadData,
  }
}
