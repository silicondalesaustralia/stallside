'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { fetchSocialWorkspaceData } from '@/lib/social/fetchSocialWorkspace'
import type {
  SocialWorkspaceBusiness,
  SocialWorkspacePost,
} from '@/lib/social/useSocialWorkspace'

const CACHE_TTL_MS = 45_000

export type TradiesPostSocialWorkspaceLoadOptions = {
  force?: boolean
}

type TradiesPostSocialWorkspaceContextValue = {
  business: SocialWorkspaceBusiness | null
  setBusiness: React.Dispatch<React.SetStateAction<SocialWorkspaceBusiness | null>>
  posts: SocialWorkspacePost[]
  setPosts: React.Dispatch<React.SetStateAction<SocialWorkspacePost[]>>
  infographicAiBackgroundEnabled: boolean
  aiDesignedEnabled: boolean
  /** True only when there is no cached workspace data yet. */
  loading: boolean
  revalidating: boolean
  loadError: string | null
  loadData: (options?: TradiesPostSocialWorkspaceLoadOptions) => Promise<void>
}

const TradiesPostSocialWorkspaceContext =
  createContext<TradiesPostSocialWorkspaceContextValue | null>(null)

export function TradiesPostSocialWorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const lastFetchedAtRef = useRef(0)
  const inFlightRef = useRef<Promise<void> | null>(null)
  const businessRef = useRef<SocialWorkspaceBusiness | null>(null)

  const [business, setBusiness] = useState<SocialWorkspaceBusiness | null>(null)
  const [posts, setPosts] = useState<SocialWorkspacePost[]>([])
  const [infographicAiBackgroundEnabled, setInfographicAiBackgroundEnabled] = useState(false)
  const [aiDesignedEnabled, setAiDesignedEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [revalidating, setRevalidating] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const applyFetchResult = useCallback(
    (result: Awaited<ReturnType<typeof fetchSocialWorkspaceData>>) => {
      if (result.unauthorized) {
        router.push('/login')
        return
      }
      if (result.error) {
        setLoadError(result.error)
        return
      }
      setLoadError(null)
      if (result.business) {
        setBusiness(result.business)
        businessRef.current = result.business
      }
      setPosts(result.posts)
      setInfographicAiBackgroundEnabled(result.features.infographicAiBackground)
      setAiDesignedEnabled(result.features.aiDesignedEnabled)
      lastFetchedAtRef.current = Date.now()
    },
    [router],
  )

  const loadData = useCallback(
    async (options?: TradiesPostSocialWorkspaceLoadOptions) => {
      const force = options?.force === true
      const hasCache = businessRef.current !== null
      const isFresh = Date.now() - lastFetchedAtRef.current < CACHE_TTL_MS

      if (!force && hasCache && isFresh) {
        return
      }

      if (inFlightRef.current) {
        await inFlightRef.current
        if (!force && businessRef.current !== null && Date.now() - lastFetchedAtRef.current < CACHE_TTL_MS) {
          return
        }
      }

      const run = async () => {
        if (!hasCache) {
          setLoading(true)
        } else {
          setRevalidating(true)
        }
        setLoadError(null)

        try {
          const result = await fetchSocialWorkspaceData()
          applyFetchResult(result)
        } finally {
          setLoading(false)
          setRevalidating(false)
          inFlightRef.current = null
        }
      }

      inFlightRef.current = run()
      await inFlightRef.current
    },
    [applyFetchResult],
  )

  useEffect(() => {
    void loadData()
    // Initial load only - subsequent refreshes are explicit or TTL-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setBusinessSynced = useCallback(
    (value: React.SetStateAction<SocialWorkspaceBusiness | null>) => {
      setBusiness((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        businessRef.current = next
        return next
      })
    },
    [],
  )

  const value = useMemo(
    () => ({
      business,
      setBusiness: setBusinessSynced,
      posts,
      setPosts,
      infographicAiBackgroundEnabled,
      aiDesignedEnabled,
      loading,
      revalidating,
      loadError,
      loadData,
    }),
    [
      business,
      posts,
      infographicAiBackgroundEnabled,
      aiDesignedEnabled,
      loading,
      revalidating,
      loadError,
      loadData,
      setBusinessSynced,
    ],
  )

  return (
    <TradiesPostSocialWorkspaceContext.Provider value={value}>
      {children}
    </TradiesPostSocialWorkspaceContext.Provider>
  )
}

export function useTradiesPostSocialWorkspace() {
  const ctx = useContext(TradiesPostSocialWorkspaceContext)
  if (!ctx) {
    throw new Error('useTradiesPostSocialWorkspace must be used within TradiesPostSocialWorkspaceProvider')
  }
  return ctx
}
