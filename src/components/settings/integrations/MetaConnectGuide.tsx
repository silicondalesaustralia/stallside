'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type MetaGuideSection =
  | 'before'
  | 'create-page'
  | 'setup-instagram'
  | 'during-login'
  | 'troubleshoot-no-pages'
  | 'troubleshoot-no-ig'
  | 'troubleshoot-business-suite'

interface MetaConnectGuideProps {
  initialSection?: MetaGuideSection
  onClose: () => void
  onStartConnect?: () => void
}

const META_PAGE_CREATE_URL = 'https://www.facebook.com/pages/create'
const META_BUSINESS_HELP_URL = 'https://www.facebook.com/business/help'

function Section({
  id,
  title,
  children,
  highlight,
}: {
  id: MetaGuideSection
  title: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <section
      id={`meta-guide-${id}`}
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

export function MetaConnectGuide({
  initialSection = 'before',
  onClose,
  onStartConnect,
}: MetaConnectGuideProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#666]">
        Facebook and Instagram auto-posting uses Meta&apos;s official rules - every scheduling tool works the same way.
        Follow these steps before connecting.
      </p>

      <Section id="before" title="A. Before you connect" highlight={initialSection === 'before'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>You need a <strong>Facebook Page</strong> for your business - not just a personal profile.</li>
          <li>For Instagram auto-post (current method): Instagram must be a <strong>Business or Creator</strong> account linked to that Page.</li>
          <li>You&apos;ll log in with Facebook and grant Vendl permission to publish to your Page.</li>
        </ol>
      </Section>

      <Section id="create-page" title="B. Create a Facebook Page" highlight={initialSection === 'create-page'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>Open Meta&apos;s Page creation flow (link below).</li>
          <li>Enter your <strong>business name</strong> and choose a category (e.g. Electrician, Plumber).</li>
          <li>Add your phone or website if you have one - optional but helps customers find you.</li>
          <li>When the Page is live, return here and tap <strong>Connect Facebook</strong>.</li>
        </ol>
        <a
          href={META_PAGE_CREATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#B8860B] hover:underline"
        >
          Create a Facebook Page on Meta
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Section>

      <Section id="setup-instagram" title="C. Set up Instagram" highlight={initialSection === 'setup-instagram'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>In the Instagram app: <strong>Settings → Account → Switch to professional account</strong> (Business or Creator).</li>
          <li><strong>Edit profile → Page</strong> - link your Facebook Page, or create one during setup.</li>
          <li>Or in Facebook: open your Page → <strong>Settings → Linked accounts → Instagram</strong> → Connect account.</li>
          <li>Return here and connect Instagram after Facebook is connected.</li>
        </ol>
      </Section>

      <Section id="during-login" title="D. During Meta login" highlight={initialSection === 'during-login'}>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>Sign in with the Facebook account that <strong>manages your business Page</strong>.</li>
          <li>When asked, select <strong>Opt in to all current and future Pages</strong> (and Businesses if shown).</li>
          <li>Enable all permissions Vendl requests, then Save / Continue.</li>
          <li>Back in Vendl, <strong>choose the correct Page</strong> from the list - especially if you manage more than one.</li>
        </ol>
      </Section>

      <Section id="troubleshoot-no-pages" title="E. No Facebook Page found" highlight={initialSection === 'troubleshoot-no-pages'}>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>Create a Page first (section B) - personal profiles don&apos;t count.</li>
          <li>Make sure you&apos;re an <strong>admin</strong> of the Page in Meta settings.</li>
          <li>During login, opt in to <strong>all Pages</strong> - don&apos;t leave any unchecked.</li>
        </ul>
      </Section>

      <Section id="troubleshoot-no-ig" title="E. No Instagram linked" highlight={initialSection === 'troubleshoot-no-ig'}>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>Convert Instagram to Business or Creator (section C).</li>
          <li>Link Instagram to your Facebook Page in Page settings - not just your personal profile.</li>
          <li>Wait a few minutes after linking, then try Connect Instagram again.</li>
        </ul>
      </Section>

      <Section id="troubleshoot-business-suite" title="E. Page managed in Meta Business Suite" highlight={initialSection === 'troubleshoot-business-suite'}>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>If your Page lives in Meta Business Suite, you must grant access to <strong>all businesses</strong> during login.</li>
          <li>Confirm you have <strong>Full control</strong> of the Page in Business Settings → People → your name → Page assets.</li>
          <li>
            <a href={META_BUSINESS_HELP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#B8860B] hover:underline">
              Meta Business Help
            </a>
            {' '}has steps if you manage the Page through a business account.
          </li>
        </ul>
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
