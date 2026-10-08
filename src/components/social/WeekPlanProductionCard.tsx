'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { RecreateLogoPicker, type RecreateLogoSelection } from '@/components/social/RecreateLogoPicker'
import { PlannerScheduleForm } from '@/components/social/PlannerScheduleForm'
import { PlannerCardOverflowMenu } from '@/components/social/PlannerCardOverflowMenu'
import {
  libraryHasSavedCaption,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import {
  automaticPostingAvailable,
  defaultPlannerPublishingMode,
} from '@/lib/social/weekPlan/weekPlanPermissions'
import { derivePlannerCardActions } from '@/lib/social/weekPlan/weekPlanCardActions'
import {
  formatCalendarDayHeading,
  formatCalendarPostTime,
  scheduledDateKey,
} from '@/lib/social/socialCalendar'
import type { WeekPlanItemRow, WeekPlanPlatform } from '@/lib/social/weekPlan/types'
import type { PlannerOverflowAction } from '@/lib/social/weekPlan/weekPlanCardActions'
import { formatWeekPlanDayLabel, mondayOfWeekContaining, resolveBusinessTimeZone } from '@/lib/social/weekPlan/weekIdentity'
import { WEEK_PLAN_POST_TYPE_LABELS } from '@/lib/social/weekPlan/postTypeMapping'

type ScheduledPostInfo = {
  scheduled_for: string | null
  platforms: string[]
  status: string
  publishing_mode?: string
  publishState?: string
} | null

type Props = {
  planId: string
  item: WeekPlanItemRow
  timeZone: string
  readOnly: boolean
  connected: SocialConnectionState
  defaultPlatforms: WeekPlanPlatform[]
  scheduledPost: ScheduledPostInfo
  publishState?: string
  onUpdated: (item: WeekPlanItemRow) => void
  onPostsChanged?: () => void
}

export function WeekPlanProductionCard({
  planId,
  item,
  timeZone,
  readOnly,
  connected,
  defaultPlatforms,
  scheduledPost,
  publishState,
  onUpdated,
  onPostsChanged,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const [captionDraft, setCaptionDraft] = useState(item.caption ?? '')
  const [editingCaption, setEditingCaption] = useState(false)
  const [quickChangeText, setQuickChangeText] = useState('')
  const [showQuickChangeConfirm, setShowQuickChangeConfirm] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPublishPlatform[]>(
    () => {
      const fromItem = (item.platforms ?? []) as SocialPublishPlatform[]
      if (fromItem.length) return fromItem
      return (defaultPlatforms as SocialPublishPlatform[]).length
        ? (defaultPlatforms as SocialPublishPlatform[])
        : ['facebook', 'instagram']
    },
  )
  const [scheduledDate, setScheduledDate] = useState(item.target_date)
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [publishingMode, setPublishingMode] = useState<'automatic' | 'manual'>('manual')
  const autoAvailable = automaticPostingAvailable(selectedPlatforms, connected)

  function openSchedulePanel(fromItem?: WeekPlanItemRow) {
    const target = fromItem ?? item
    setScheduledDate(target.target_date)
    setPublishingMode(defaultPlannerPublishingMode(selectedPlatforms, connected))
    setScheduleOpen(true)
  }

  function toggleSchedulePlatform(platform: SocialPublishPlatform) {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
      if (!automaticPostingAvailable(next, connected)) {
        setPublishingMode('manual')
      }
      return next
    })
  }

  const previews = item.variant_previews ?? []
  const selectedId = item.selected_variant_id
  const selectedPreview = previews.find((p) => p.id === selectedId) ?? previews[0] ?? null
  const cardActions = derivePlannerCardActions({
    item,
    readOnly,
    publishState,
    scheduledPost,
    hasPreviews: previews.length > 0,
  })
  const canProduce =
    item.generation_status === 'generated' &&
    !readOnly &&
    item.review_status !== 'scheduled' &&
    item.review_status !== 'skipped'

  async function selectVariant(variantId: string) {
    setBusy('select')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/select-variant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId }),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Selection failed')
      onUpdated(json.item)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Selection failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function saveCaption() {
    setBusy('caption')
    try {
      const res = await fetch(`/api/social/week-plan/${planId}/items/${item.id}/caption`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionDraft }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      onUpdated(json.item)
      setEditingCaption(false)
      toast('Caption saved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function regenerateCaption() {
    setBusy('regen-caption')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/regenerate-caption`,
        { method: 'POST' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Regenerate failed')
      setCaptionDraft(json.item.caption ?? '')
      onUpdated(json.item)
      toast('Caption regenerated', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Regenerate failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function runQuickChange() {
    setBusy('quick-change')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/quick-change`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adjustment: quickChangeText }),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Quick change failed')
      setQuickChangeText('')
      setShowQuickChangeConfirm(false)
      setCaptionDraft(json.item.caption ?? '')
      onUpdated(json.item)
      toast('3 new designs created - 1 render used', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Quick change failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function approvePost() {
    setBusy('approve')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/approve-post`,
        { method: 'POST' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Approve failed')
      onUpdated(json.item)
      toast('Post approved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Approve failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function approveAndSchedule() {
    if (item.review_status === 'approved') {
      openSchedulePanel()
      return
    }
    setBusy('approve-schedule')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/approve-post`,
        { method: 'POST' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Approve failed')
      onUpdated(json.item)
      openSchedulePanel(json.item as WeekPlanItemRow)
      toast('Post approved - pick a date and posting method', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Approve failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function skipPost() {
    if (!confirm('Skip this post for the week? Already-used generation credits are not refunded.')) {
      return
    }
    setBusy('skip')
    try {
      const res = await fetch(`/api/social/week-plan/${planId}/items/${item.id}/skip`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Skip failed')
      onUpdated(json.item)
      toast('Post skipped', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Skip failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function schedulePost() {
    if (item.review_status !== 'approved') {
      toast('Approve this post before adding to calendar', 'error')
      return
    }
    if (!libraryHasSavedCaption(captionDraft)) {
      toast('Add a caption first', 'error')
      return
    }
    if (selectedPlatforms.length === 0) {
      toast('Select at least one platform', 'error')
      return
    }
    const mode = autoAvailable ? publishingMode : 'manual'
    if (mode === 'automatic' && !autoAvailable) {
      toast('Connect all selected platforms to use Automatic posting, or choose Manual posting.', 'error')
      return
    }
    setBusy('schedule')
    try {
      const res = await fetch(`/api/social/week-plan/${planId}/items/${item.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          scheduledTime,
          platforms: selectedPlatforms,
          publishingMode: mode,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Schedule failed')
      onUpdated(json.item)
      setScheduleOpen(false)
      onPostsChanged?.()
      toast(
        mode === 'manual' ? 'Added to calendar (manual post)' : 'Scheduled automatically',
        'success',
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Schedule failed'
      if (item.review_status === 'approved' || item.hybrid_render_id) {
        toast(
          "Your post was approved, but we couldn't schedule it. You can try scheduling again.",
          'error',
        )
      } else {
        toast(message, 'error')
      }
    } finally {
      setBusy(null)
    }
  }

  async function chooseAgain() {
    if (!confirm('Choose another design? Your caption and previews stay - selection and approval will be cleared. Any future scheduled post will be cancelled.')) {
      return
    }
    setBusy('choose-again')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/choose-again`,
        { method: 'POST' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Reset failed')
      onUpdated(json.item)
      toast('You can choose another design', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reset failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function startAgain() {
    if (
      !confirm(
        'This will clear the current designs, caption and approval.\n\nAny future scheduled post will be cancelled.\n\nPreviously published posts stay in your history.\n\nCreating new designs later will use a render.',
      )
    ) {
      return
    }
    setBusy('start-again')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/start-again`,
        { method: 'POST' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Start again failed')
      setCaptionDraft('')
      onUpdated(json.item)
      toast('Post reset - generate new designs when ready', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Start again failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function movePost() {
    const next = prompt('New date (YYYY-MM-DD):', item.target_date)
    if (!next?.trim()) return
    setBusy('move')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetDate: next.trim() }),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Move failed')
      onUpdated(json.item)
      onPostsChanged?.()
      toast('Post date updated', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Move failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function restorePrevious() {
    setBusy('restore')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/restore-previous`,
        { method: 'POST' },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Restore failed')
      onUpdated(json.item)
      toast('Previous designs restored', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Restore failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function applyLogo(choice: RecreateLogoSelection) {
    if (!selectedPreview) return
    setBusy('logo')
    try {
      const res = await fetch(
        `/api/social/week-plan/${planId}/items/${item.id}/apply-logo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: selectedPreview.id,
            logoAssetId: choice.logoAssetId,
            showLogo: choice.logoAssetId !== null,
          }),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Logo update failed')
      if (json.item) {
        onUpdated(json.item as WeekPlanItemRow)
        setCaptionDraft((json.item as WeekPlanItemRow).caption ?? captionDraft)
      }
      toast('Logo updated - free', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Logo update failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function cancelSchedule() {
    const postId = item.scheduled_social_post_id
    if (!postId) return
    if (!confirm('Cancel this scheduled post?')) return
    setBusy('cancel-schedule')
    try {
      const res = await fetch(`/api/social/posts/${postId}/cancel`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Cancel failed')
      onPostsChanged?.()
      await loadItemAfterChange(json.item as WeekPlanItemRow | undefined)
      toast('Schedule cancelled', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Cancel failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function markPostedManual() {
    const postId = item.scheduled_social_post_id
    if (!postId) return
    if (!confirm('Mark this post as manually posted?')) return
    setBusy('mark-posted')
    try {
      const res = await fetch(`/api/social/posts/${postId}/mark-posted`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not mark as posted')
      onPostsChanged?.()
      await loadItemAfterChange()
      toast('Marked as posted', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not mark as posted', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function loadItemAfterChange(fallback?: WeekPlanItemRow) {
    if (fallback) {
      onUpdated(fallback)
      return
    }
    try {
      const res = await fetch(`/api/social/week-plan/${planId}`)
      if (!res.ok) return
      const json = await res.json()
      const updated = (json.items as WeekPlanItemRow[]).find((i) => i.id === item.id)
      if (updated) onUpdated(updated)
    } catch {
      /* parent reload handles */
    }
  }

  function viewInCalendar() {
    const dayKey =
      scheduledPost?.scheduled_for
        ? scheduledDateKey(scheduledPost.scheduled_for, timeZone)
        : item.target_date
    const weekStart = mondayOfWeekContaining(dayKey, resolveBusinessTimeZone(timeZone))
    router.push(
      `/dashboard/social?tab=calendar&calendarWeekStart=${weekStart}${
        item.scheduled_social_post_id ? `&calendarPostId=${item.scheduled_social_post_id}` : ''
      }`,
    )
  }

  function handlePrimaryAction() {
    switch (cardActions.primaryKind) {
      case 'approveAndSchedule':
        void approveAndSchedule()
        break
      case 'addToCalendar':
        openSchedulePanel()
        break
      case 'viewInCalendar':
        viewInCalendar()
        break
      case 'viewPublished':
        router.push('/dashboard/social?tab=published')
        break
      case 'markPosted':
        void markPostedManual()
        break
      default:
        break
    }
  }

  function handleSecondaryAction() {
    switch (cardActions.secondaryKind) {
      case 'approveOnly':
        void approvePost()
        break
      case 'changeDesign':
        void chooseAgain()
        break
      case 'markPosted':
        void markPostedManual()
        break
      default:
        break
    }
  }

  function handleOverflowAction(action: PlannerOverflowAction) {
    switch (action) {
      case 'chooseAgain':
        void chooseAgain()
        break
      case 'startAgain':
        void startAgain()
        break
      case 'skip':
        void skipPost()
        break
      case 'move':
        void movePost()
        break
      case 'cancelSchedule':
        void cancelSchedule()
        break
      case 'viewPublished':
        router.push('/dashboard/social?tab=published')
        break
      default:
        break
    }
  }

  return (
    <article className="rounded-2xl border border-[#EDEAE2] bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#888]">
            {formatWeekPlanDayLabel(item.target_date, timeZone)}
          </p>
          <p className="text-xs font-semibold text-[#886600]">
            {WEEK_PLAN_POST_TYPE_LABELS[item.post_type]}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#222]">{item.topic}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cardActions.statusClass}`}>
          {cardActions.statusLabel}
        </span>
      </div>

      {item.generation_status === 'failed' && item.generation_error && (
        <p className="mt-2 text-xs text-red-600">{item.generation_error}</p>
      )}

      {previews.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#888]">Designs</p>

          {selectedPreview && (
            <div className="overflow-hidden rounded-xl border border-[#EDEAE2] bg-[#FAFAF8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreview.imageUrl}
                alt="Selected design preview"
                className="w-full max-h-[420px] object-contain bg-[#111]/5"
              />
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {previews.map((preview, idx) => {
              const isSelected = preview.id === selectedId
              return (
                <button
                  key={preview.id}
                  type="button"
                  disabled={!canProduce || busy !== null}
                  onClick={() => void selectVariant(preview.id)}
                  className={`shrink-0 w-24 overflow-hidden rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-[#FFD700] ring-2 ring-[#FFD700]/40'
                      : 'border-[#EDEAE2] hover:border-[#CCC]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.imageUrl}
                    alt={`Preview ${idx + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  <p className="px-1 py-1 text-[10px] font-semibold text-center text-[#666]">
                    {isSelected ? '✓ Selected' : `Preview ${idx + 1}`}
                  </p>
                </button>
              )
            })}
          </div>

          <p className="text-[10px] text-[#888]">
            Selecting a design: free · Changing selection: free
          </p>

          {item.variant_previews_previous?.length ? (
            <button
              type="button"
              disabled={!canProduce || busy !== null}
              onClick={() => void restorePrevious()}
              className="text-xs font-bold text-[#886600] hover:underline"
            >
              Restore previous designs
            </button>
          ) : null}

          {canProduce && selectedPreview?.baseStoragePath && (
            <div className="pt-2">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#888]">Logo</p>
              <RecreateLogoPicker
                value={{
                  logoAssetId: selectedPreview.logoAssetId ?? undefined,
                  logoVariantType: selectedPreview.logoVariantType ?? null,
                }}
                onChange={(choice) => void applyLogo(choice)}
              />
              <p className="mt-1 text-[10px] text-[#888]">Logo change: free</p>
            </div>
          )}
        </div>
      )}

      {(item.caption || canProduce) && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#888]">Caption</p>
          {editingCaption && canProduce ? (
            <textarea
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
            />
          ) : (
            <p className="text-sm text-[#333] whitespace-pre-wrap">{captionDraft || '-'}</p>
          )}
          {canProduce && (
            <div className="flex flex-wrap gap-2">
              {editingCaption ? (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void saveCaption()}
                  className="rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-black text-black"
                >
                  Save caption
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingCaption(true)}
                  className="text-xs font-bold text-[#666] hover:underline"
                >
                  Edit caption
                </button>
              )}
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void regenerateCaption()}
                className="text-xs font-bold text-[#666] hover:underline"
              >
                Regenerate caption
              </button>
            </div>
          )}
          <p className="text-[10px] text-[#888]">Caption edit/regenerate: free</p>
        </div>
      )}

      {cardActions.showQuickChange && canProduce && (
        <div className="mt-4 space-y-2 border-t border-[#F0EDE5] pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#888]">
            Edit design
          </p>
          <p className="text-xs text-[#666]">Tell StitchedUp what you&apos;d like changed.</p>
          <textarea
            value={quickChangeText}
            onChange={(e) => setQuickChangeText(e.target.value.slice(0, 800))}
            rows={2}
            placeholder="Make the headline shorter and use more navy."
            className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
          />
          {!showQuickChangeConfirm ? (
            <button
              type="button"
              disabled={!quickChangeText.trim() || busy !== null}
              onClick={() => setShowQuickChangeConfirm(true)}
              className="rounded-lg border border-[#EDEAE2] px-3 py-2 text-xs font-bold text-[#444]"
            >
              Apply change
            </button>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-xs text-[#664]">
                This will create 3 new designs and use <strong>1 render</strong>.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickChangeConfirm(false)}
                  className="text-xs font-bold text-[#666]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void runQuickChange()}
                  className="rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-black text-black"
                >
                  Create 3 new designs
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(cardActions.primaryLabel || cardActions.secondaryLabel || cardActions.overflow.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F0EDE5] pt-4">
          {cardActions.primaryLabel && cardActions.primaryKind === 'addToCalendar' && scheduleOpen ? (
            <PlannerScheduleForm
              itemId={item.id}
              connected={connected}
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={toggleSchedulePlatform}
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
              onScheduledDate={setScheduledDate}
              onScheduledTime={setScheduledTime}
              publishingMode={publishingMode}
              onPublishingMode={setPublishingMode}
              onSubmit={() => void schedulePost()}
              onCancel={() => setScheduleOpen(false)}
              submitting={busy === 'schedule'}
            />
          ) : (
            <>
              {cardActions.primaryLabel && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={handlePrimaryAction}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-black px-4 py-2.5 text-sm font-black text-white disabled:opacity-50 sm:w-auto"
                >
                  {busy === 'approve-schedule' || busy === 'schedule' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Working…
                    </>
                  ) : cardActions.primaryKind === 'approveAndSchedule' ? (
                    <>
                      <Sparkles className="h-4 w-4" /> {cardActions.primaryLabel}
                    </>
                  ) : (
                    cardActions.primaryLabel
                  )}
                </button>
              )}
              {cardActions.secondaryLabel && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={handleSecondaryAction}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#EDEAE2] bg-white px-4 py-2.5 text-sm font-bold text-[#444] disabled:opacity-50"
                >
                  {cardActions.secondaryKind === 'approveOnly' && (
                    <Check className="h-4 w-4" />
                  )}
                  {cardActions.secondaryLabel}
                </button>
              )}
              <PlannerCardOverflowMenu
                actions={cardActions.overflow}
                disabled={busy !== null}
                onAction={handleOverflowAction}
              />
            </>
          )}
        </div>
      )}

      {item.review_status === 'scheduled' && scheduledPost?.scheduled_for && (
        <div className="mt-3 rounded-lg border border-green-100 bg-green-50 p-3 text-sm">
          <p className="font-semibold text-green-800">
            {scheduledPost.publishing_mode === 'manual' ? 'Manual' : 'Automatic'}
            {' · '}
            {formatCalendarDayHeading(scheduledDateKey(scheduledPost.scheduled_for, timeZone), timeZone)}
            {' · '}
            {formatCalendarPostTime(scheduledPost.scheduled_for, timeZone)}
          </p>
          <p className="mt-1 text-xs text-green-700">
            {scheduledPost.platforms.join(' · ')}
          </p>
        </div>
      )}

      {busy && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[#888]">
          <Loader2 className="h-3 w-3 animate-spin" /> Working…
        </p>
      )}
    </article>
  )
}
