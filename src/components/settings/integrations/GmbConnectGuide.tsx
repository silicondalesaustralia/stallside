'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { GmbGuideSection } from '@/lib/social/gmbConnectErrors'

interface GmbConnectGuideProps {
  initialSection?: GmbGuideSection
  onClose: () => void
  onStartConnect?: () => void
}

const GBP_MANAGER_URL = 'https://business.google.com/'
const GBP_HELP_URL = 'https://support.google.com/business/answer/2911778'

function Section({
  id,
  title,
  children,
  highlight,
}: {
  id: GmbGuideSection
  title: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <section
      id={`gmb-guide-${id}`}
      className={`rounded-xl border p-4 ${
        highlight
          ? 'border-[#FFD100]/50 bg-[#FFFBEA]'
          : 'border-warm-border bg-surface-nested'
      }`}
    >
      <h3 className="mb-2 text-sm font-semibold text-[#111]">{title}</h3>
      <div className="space-y-2 text-sm text-[#666]">{children}</div>
    </section>
  )
}

export function GmbConnectGuide({
  initialSection = 'before',
  onClose,
  onStartConnect,
}: GmbConnectGuideProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#666]">
        Google Business Profile auto-posting uses Google&apos;s official OAuth - you sign in with the Google account
        that owns or manages your business listing.
      </p>

      <Section id="before" title="A. Before you connect" highlight={initialSection === 'before'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>You need a <strong>Google Business Profile</strong> listing (formerly Google My Business).</li>
          <li>The listing should be <strong>verified</strong> with Google.</li>
          <li>Sign in with the Google account that is an <strong>owner or manager</strong> on that listing.</li>
          <li>If you have multiple locations (e.g. depots), you&apos;ll pick which one StitchedUp should post to.</li>
        </ol>
      </Section>

      <Section id="create-profile" title="B. Create a Business Profile" highlight={initialSection === 'create-profile'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>Open Google Business Profile and add your business name, address, and category.</li>
          <li>Complete verification when Google prompts you (postcard, phone, or email).</li>
          <li>Once verified, return here and connect.</li>
        </ol>
        <a
          href={GBP_MANAGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#B8860B] hover:underline"
        >
          Open Google Business Profile
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Section>

      <Section id="verify-profile" title="C. Verify your listing" highlight={initialSection === 'verify-profile'}>
        <p>
          Unverified listings may not appear in connect results. Follow Google&apos;s verification steps in the Business
          Profile dashboard until your listing shows as verified.
        </p>
        <a
          href={GBP_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#B8860B] hover:underline"
        >
          Google verification help
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Section>

      <Section id="during-login" title="D. During Google sign-in" highlight={initialSection === 'during-login'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>Use the Google account that manages your business - not a personal account with no GBP access.</li>
          <li>Grant StitchedUp permission to <strong>manage your Business Profile</strong> when asked.</li>
          <li>Google will email you confirming that a third-party app was granted access - that&apos;s expected.</li>
        </ol>
      </Section>

      <Section
        id="troubleshoot-no-locations"
        title="E. No locations found"
        highlight={initialSection === 'troubleshoot-no-locations'}
      >
        <ul className="list-disc space-y-1.5 pl-4">
          <li>Confirm the listing exists in Google Business Profile for this Google account.</li>
          <li>Check you are listed as owner or manager on the profile.</li>
          <li>If you use Google Workspace, ensure Business Profile is enabled for your organisation.</li>
        </ul>
      </Section>

      <Section
        id="troubleshoot-not-manager"
        title="F. Not the profile manager"
        highlight={initialSection === 'troubleshoot-not-manager'}
      >
        <p>
          Only owners and managers can authorise posting. Ask the primary owner to add your Google account as a manager
          in Business Profile settings, or connect using the owner&apos;s account.
        </p>
      </Section>

      <div className="flex flex-wrap gap-2 border-t border-warm-border pt-4">
        {onStartConnect && (
          <Button type="button" onClick={onStartConnect}>
            Start connect flow
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
