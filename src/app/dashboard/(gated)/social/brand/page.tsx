'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { TradiesPostBrandLogosPanel } from '@/components/tradiespost/brand/TradiesPostBrandLogosPanel'
import { TradiesPostBrandPreviewCard } from '@/components/tradiespost/brand/TradiesPostBrandPreviewCard'
import { TradiesPostBrandSectionCard } from '@/components/tradiespost/brand/TradiesPostBrandSectionCard'
import { TradiesPostAppPage, TradiesPostLoading } from '@/components/tradiespost/TradiesPostAppPage'
import {
  TradiesPostButtonLight,
  TradiesPostPageHeader,
} from '@/components/tradiespost/ui'
import { TradiesPostLabel } from '@/components/tradiespost/ui/TradiesPostTypography'

const TP_BRAND_SWATCHES = [
  '#F5C518',
  '#18181B',
  '#2563EB',
  '#16A34A',
  '#DC2626',
  '#9333EA',
  '#EA580C',
  '#0891B2',
]

type BrandForm = {
  id: string
  name: string | null
  website: string | null
  logo_url: string | null
  brand_color: string | null
  brand_text_color: string | null
  ai_agent_services: string | null
  address: string | null
  phone: string | null
}

function fieldLabelProps(id: string) {
  return {
    htmlFor: id,
    className: 'mb-1.5 block',
  }
}

export default function TradiesPostBrandPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedRecently, setSavedRecently] = useState(false)
  const [form, setForm] = useState<BrandForm | null>(null)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!savedRecently) return
    const timer = window.setTimeout(() => setSavedRecently(false), 3000)
    return () => window.clearTimeout(timer)
  }, [savedRecently])

  async function load() {
    try {
      const res = await fetch('/api/tradiespost/brand')
      const json = (await res.json().catch(() => ({}))) as {
        error?: string
        business?: BrandForm
        canEdit?: boolean
      }
      if (!res.ok) throw new Error(json.error || 'Could not load brand')
      if (!json.business) throw new Error('No business row')
      setCanEdit(Boolean(json.canEdit))
      setForm(json.business)
    } catch (err) {
      console.error('[TradiesPost Brand]', err)
      toast('Could not load brand settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    if (!form) return
    setSaving(true)
    setSavedRecently(false)
    try {
      const res = await fetch('/api/tradiespost/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          website: form.website,
          brand_color: form.brand_color,
          brand_text_color: form.brand_text_color,
          ai_agent_services: form.ai_agent_services,
          address: form.address,
          phone: form.phone,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Save failed')
      setSavedRecently(true)
      toast('Brand saved', 'success')
    } catch (err) {
      console.error('[TradiesPost Brand save]', err)
      toast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  function patchForm(patch: Partial<BrandForm>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  if (loading) return <TradiesPostLoading />

  if (!form) {
    return (
      <TradiesPostAppPage>
        <p className="text-sm text-zinc-500">Could not load brand data.</p>
      </TradiesPostAppPage>
    )
  }

  const brandColor = form.brand_color ?? '#F5C518'
  const brandTextColor = form.brand_text_color ?? '#18181B'

  return (
    <TradiesPostAppPage maxWidth="lg">
      <TradiesPostPageHeader
        title="Brand"
        subtitle="This is how TradiesPost makes every post look and sound like you."
      />
      {!canEdit ? (
        <p className="mt-2 text-sm text-zinc-600">
          Brand settings are managed by the owner or admin. You can still use these assets on posts.
        </p>
      ) : null}

      <div className="mt-6 lg:grid lg:grid-cols-5 lg:items-start lg:gap-6">
        <div className="space-y-4 lg:col-span-3">
          <TradiesPostBrandSectionCard title="Business">
            <div className="space-y-4">
              <div>
                <TradiesPostLabel {...fieldLabelProps('tp-brand-name')}>Business name</TradiesPostLabel>
                <Input
                  id="tp-brand-name"
                  value={form.name ?? ''}
                  onChange={(e) => patchForm({ name: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <TradiesPostLabel {...fieldLabelProps('tp-brand-website')}>Website</TradiesPostLabel>
                <Input
                  id="tp-brand-website"
                  value={form.website ?? ''}
                  onChange={(e) => patchForm({ website: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <TradiesPostLabel {...fieldLabelProps('tp-brand-phone')}>Phone</TradiesPostLabel>
                <Input
                  id="tp-brand-phone"
                  value={form.phone ?? ''}
                  onChange={(e) => patchForm({ phone: e.target.value })}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <TradiesPostLabel {...fieldLabelProps('tp-brand-area')}>Service area</TradiesPostLabel>
                <Input
                  id="tp-brand-area"
                  value={form.address ?? ''}
                  onChange={(e) => patchForm({ address: e.target.value })}
                  placeholder="e.g. Parramatta and Western Sydney"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </TradiesPostBrandSectionCard>

          <TradiesPostBrandSectionCard title="What you do">
            <div>
              <TradiesPostLabel {...fieldLabelProps('tp-brand-services')}>
                Services & business context
              </TradiesPostLabel>
              <Textarea
                id="tp-brand-services"
                rows={5}
                value={form.ai_agent_services ?? ''}
                onChange={(e) => patchForm({ ai_agent_services: e.target.value })}
                placeholder="What you do, how you talk, and what makes your business different - used for captions and AI context."
                disabled={!canEdit}
              />
            </div>
          </TradiesPostBrandSectionCard>

          <TradiesPostBrandSectionCard title="Colours">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <TradiesPostLabel className="mb-2 block">Primary brand colour</TradiesPostLabel>
                <div className="mb-3 flex flex-wrap gap-2">
                  {TP_BRAND_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => patchForm({ brand_color: color })}
                      className={`h-9 w-9 rounded-lg border-2 transition-transform hover:scale-105 ${
                        brandColor === color
                          ? 'border-[#18181B] ring-2 ring-[#F5C518]/40'
                          : 'border-zinc-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Brand colour ${color}`}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  className="h-11 w-full cursor-pointer"
                  value={brandColor}
                  onChange={(e) => patchForm({ brand_color: e.target.value })}
                />
              </div>
              <div>
                <TradiesPostLabel className="mb-2 block">Text colour</TradiesPostLabel>
                <div className="mb-3 flex gap-2">
                  {['#18181B', '#FFFFFF', '#F5C518'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => patchForm({ brand_text_color: color })}
                      className={`h-9 w-9 rounded-lg border-2 transition-transform hover:scale-105 ${
                        brandTextColor === color
                          ? 'border-[#18181B] ring-2 ring-[#F5C518]/40'
                          : 'border-zinc-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Text colour ${color}`}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  className="h-11 w-full cursor-pointer"
                  value={brandTextColor}
                  onChange={(e) => patchForm({ brand_text_color: e.target.value })}
                />
              </div>
            </div>
          </TradiesPostBrandSectionCard>

          <TradiesPostBrandSectionCard title="Logos">
            <TradiesPostBrandLogosPanel
              readOnly={!canEdit}
              onPrimaryChange={(logoUrl) => patchForm({ logo_url: logoUrl })}
            />
          </TradiesPostBrandSectionCard>

          {canEdit ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <TradiesPostButtonLight
              onClick={() => void save()}
              disabled={saving}
              variant="primary"
              size="md"
              data-testid="tp-brand-save"
            >
              {saving ? 'Saving…' : savedRecently ? 'Saved' : 'Save Brand'}
            </TradiesPostButtonLight>
            {savedRecently && !saving ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Check className="h-4 w-4" />
                Brand profile updated
              </span>
            ) : null}
          </div>
          ) : null}
        </div>

        <div className="mt-6 lg:col-span-2 lg:mt-0">
          <TradiesPostBrandPreviewCard
            businessName={form.name ?? ''}
            serviceArea={form.address}
            brandColor={brandColor}
            brandTextColor={brandTextColor}
            logoUrl={form.logo_url}
          />
        </div>
      </div>
    </TradiesPostAppPage>
  )
}
