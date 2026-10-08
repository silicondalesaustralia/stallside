'use client'

import { useEffect, useState } from 'react'
import { MetaConnectSection } from '@/components/settings/integrations/MetaConnectSection'
import { GmbConnectProvider } from '@/components/settings/integrations/GmbConnectContext'
import { TradiesPostGmbConnectionCard } from '@/components/tradiespost/connections/TradiesPostGmbConnectionCard'
import { TradiesPostTikTokConnectionCard } from '@/components/tradiespost/connections/TradiesPostTikTokConnectionCard'
import { TradiesPostJobSoftwareSection } from '@/components/tradiespost/connections/TradiesPostJobSoftwareSection'
import { TradiesPostCalendarConnectionsSection } from '@/components/tradiespost/connections/TradiesPostCalendarConnectionsSection'
import { TradiesPostAppPage, TradiesPostLoading } from '@/components/tradiespost/TradiesPostAppPage'
import { TradiesPostPageHeader } from '@/components/tradiespost/ui'
import { TradiesPostSectionTitle } from '@/components/tradiespost/ui/TradiesPostTypography'
import { canManageTradiesPostConnections } from '@/lib/products/tradiesPostTeam'

export default function TradiesPostConnectionsPage() {
  const [business, setBusiness] = useState<{
    facebook_page_id?: string | null
    facebook_page_name?: string | null
    instagram_account_id?: string | null
    instagram_username?: string | null
    gmb_account_id?: string | null
    gmb_location_name?: string | null
    tiktok_open_id?: string | null
    tiktok_display_name?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    void loadBusiness()
  }, [])

  async function loadBusiness() {
    try {
      const [ctxRes, socialRes] = await Promise.all([
        fetch('/api/me/context'),
        fetch('/api/social/context'),
      ])
      if (ctxRes.ok) {
        const ctx = await ctxRes.json()
        setCanManage(
          Boolean(ctx.isImpersonating) ||
            canManageTradiesPostConnections(ctx.user?.role, ctx.user?.permissions),
        )
      }
      if (!socialRes.ok) throw new Error('Could not load connections')
      const social = await socialRes.json()
      setBusiness(social.business ?? null)
    } catch (err) {
      console.error('[TradiesPost Connections]', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <TradiesPostLoading />

  if (!business) {
    return (
      <TradiesPostAppPage maxWidth="connections">
        <p className="text-sm text-zinc-500">Could not load connection settings.</p>
      </TradiesPostAppPage>
    )
  }

  return (
    <TradiesPostAppPage maxWidth="connections">
      <TradiesPostPageHeader
        title="Connections"
        subtitle="Connect once. Post everywhere."
      />
      {!canManage ? (
        <p className="mt-2 text-sm text-zinc-600">
          Connected accounts can be used for posting. Only the owner or admin can connect or disconnect them.
        </p>
      ) : null}

      <GmbConnectProvider
        gmbAccountId={business.gmb_account_id ?? undefined}
        gmbLocationName={business.gmb_location_name ?? undefined}
        onConnected={loadBusiness}
        integrationsPath="/dashboard/social/connections"
      >
        <section className="mt-8">
          <TradiesPostSectionTitle className="mb-5">Social accounts</TradiesPostSectionTitle>

          <div className="social-connections-grid">
            <TradiesPostGmbConnectionCard canManageConnections={canManage} />
            <MetaConnectSection
              facebookPageId={business.facebook_page_id ?? undefined}
              facebookPageName={business.facebook_page_name ?? undefined}
              instagramAccountId={business.instagram_account_id ?? undefined}
              instagramUsername={business.instagram_username ?? undefined}
              onConnected={loadBusiness}
              integrationsPath="/dashboard/social/connections"
              presentation="tradiespost"
              libraryHref="/dashboard/social/library"
              canManageConnections={canManage}
            />
            <TradiesPostTikTokConnectionCard
              tiktokOpenId={business.tiktok_open_id}
              tiktokDisplayName={business.tiktok_display_name}
              onConnected={loadBusiness}
              integrationsPath="/dashboard/social/connections"
              canManageConnections={canManage}
            />
          </div>
        </section>
      </GmbConnectProvider>

      <TradiesPostCalendarConnectionsSection />

      <TradiesPostJobSoftwareSection />
    </TradiesPostAppPage>
  )
}
