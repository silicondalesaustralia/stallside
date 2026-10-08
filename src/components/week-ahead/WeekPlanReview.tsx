'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { WEEK_PLAN_POST_TYPE_LABELS } from '@/lib/social/weekPlan/postTypeMapping'
import {
  formatWeekPlanDayLabel,
  formatWeekRangeHeading,
  weekDateRange,
} from '@/lib/social/weekPlan/weekIdentity'
import type { WeekPlanGenerationProgress } from '@/lib/social/weekPlan/weekPlanGenerationProgress'
import { WeekPlanGenerationProgressPanel } from '@/components/week-ahead/WeekPlanGenerationProgressPanel'
import { WeekPlanGeneratedReview } from '@/components/week-ahead/WeekPlanGeneratedReview'
import {
  WEEK_PLAN_MAX_POSTS,
  WEEK_PLAN_POST_TYPES,
  type WeekPlanItemRow,
  type WeekPlanPostType,
  type WeekPlanRow,
} from '@/lib/social/weekPlan/types'

type Props = {
  plan: WeekPlanRow
  items: WeekPlanItemRow[]
  timeZone: string
  weekStartDate: string
  progress?: WeekPlanGenerationProgress | null
  historyMode?: boolean
  onUpdated: (plan: WeekPlanRow, items: WeekPlanItemRow[]) => void
  onClose: () => void
  onReload: () => void
  onGenerate?: () => void
  onRetryFailed?: () => void
  generateBusy?: boolean
}

export function WeekPlanReview({
  plan,
  items: initialItems,
  timeZone,
  weekStartDate,
  progress = null,
  historyMode = false,
  onUpdated,
  onClose,
  onReload,
  onGenerate,
  onRetryFailed,
  generateBusy = false,
}: Props) {
  const { toast } = useToast()
  const [items, setItems] = useState(initialItems)
  const [planState, setPlanState] = useState(plan)
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTopic, setEditTopic] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editType, setEditType] = useState<WeekPlanPostType>('tips_advice')
  const [showAdd, setShowAdd] = useState(false)
  const [addTopic, setAddTopic] = useState('')
  const [addDate, setAddDate] = useState(weekDateRange(weekStartDate, timeZone)[0])
  const [addType, setAddType] = useState<WeekPlanPostType>('tips_advice')

  useEffect(() => {
    setItems(initialItems)
    setPlanState(plan)
  }, [initialItems, plan])

  const readOnly = historyMode || planState.status === 'plan_approved' || planState.status === 'archived'
  const structureLocked = planState.generation_status !== 'not_started'
  const isGenerating =
    planState.generation_status === 'queued' || planState.generation_status === 'generating'
  const isReady = planState.generation_status === 'ready'
  const isPartialFailed = planState.generation_status === 'partial_failed'
  const weekDates = weekDateRange(weekStartDate, timeZone)

  async function reloadPlan() {
    const res = await fetch(`/api/social/week-plan/${planState.id}`)
    if (!res.ok) return
    const json = await res.json()
    setPlanState(json.plan)
    setItems(json.items)
    onUpdated(json.plan, json.items)
    onReload()
  }

  function startEdit(item: WeekPlanItemRow) {
    setEditingId(item.id)
    setEditTopic(item.topic)
    setEditDate(item.target_date)
    setEditType(item.post_type)
  }

  async function saveEdit(itemId: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${planState.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: editTopic.trim(),
          targetDate: editDate,
          postType: editType,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      await reloadPlan()
      setEditingId(null)
      toast('Post updated', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function removeItem(itemId: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${planState.id}/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Remove failed')
      }
      await reloadPlan()
      toast('Post removed', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Remove failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function addItem() {
    setBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${planState.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: addTopic.trim(),
          targetDate: addDate,
          postType: addType,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not add post')
      await reloadPlan()
      setShowAdd(false)
      setAddTopic('')
      toast('Post added', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add post', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function regeneratePlan() {
    setBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${planState.id}/regenerate`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Regenerate failed')
      setItems(json.items)
      onUpdated(json.plan, json.items)
      toast('Plan regenerated', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Regenerate failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function approvePlan() {
    setBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${planState.id}/approve`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Approve failed')
      setPlanState(json.plan)
      onUpdated(json.plan, items)
      onReload()
      toast('Plan approved', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Approve failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function editPlan() {
    setBusy(true)
    try {
      const res = await fetch(`/api/social/week-plan/${planState.id}/reopen`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not reopen plan')
      setPlanState(json.plan)
      onUpdated(json.plan, json.items)
      toast('Plan reopened for editing', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not reopen plan', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#886600]">Your social week</p>
        <h3 className="text-xl font-black text-black">
          {formatWeekRangeHeading(planState.week_start_date, timeZone)}
        </h3>
        <p className="mt-0.5 text-sm text-[#666]">
          {items.length} post{items.length === 1 ? '' : 's'} planned
        </p>
        {readOnly ? (
          isGenerating && progress ? (
            <div className="mt-3">
              <WeekPlanGenerationProgressPanel
                progress={progress}
                items={items}
                timeZone={timeZone}
              />
            </div>
          ) : isReady && historyMode ? (
            <div className="mt-3">
              <WeekPlanGeneratedReview items={items} timeZone={timeZone} />
            </div>
          ) : isReady ? (
            <p className="mt-2 text-sm text-[#555]">
              Your week is ready - {items.length} post{items.length === 1 ? '' : 's'} with 3 designs each.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#555]">
              {historyMode
                ? 'Historical weekly plan.'
                : 'Your plan is approved. Generate 3 designs for each post when you\'re ready.'}
            </p>
          )
        ) : (
          <p className="mt-1 text-xs text-[#888]">No render credits are charged yet - planning is free.</p>
        )}
      </div>

      {!(readOnly && (isGenerating || (historyMode && isReady))) && (
      <div className="space-y-3">
        {items.map((item) => {
          const isEditing = editingId === item.id
          return (
            <article
              key={item.id}
              className="rounded-xl border border-[#EDEAE2] bg-[#FAFAF8] p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#888]">
                {formatWeekPlanDayLabel(item.target_date, timeZone)}
              </p>
              <p className="text-xs font-semibold text-[#886600] mt-0.5">
                {WEEK_PLAN_POST_TYPE_LABELS[item.post_type]}
              </p>

              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <input
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                  />
                  <select
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                  >
                    {weekDates.map((d) => (
                      <option key={d} value={d}>
                        {formatWeekPlanDayLabel(d, timeZone)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as WeekPlanPostType)}
                    className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                  >
                    {WEEK_PLAN_POST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {WEEK_PLAN_POST_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveEdit(item.id)}
                      className="rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-black text-black"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs font-semibold text-[#888]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm font-semibold text-[#222]">{item.topic}</p>
                  {!readOnly && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#666] hover:text-black"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeItem(item.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          )
        })}
      </div>
      )}

      {!readOnly && items.length < WEEK_PLAN_MAX_POSTS && (
        <>
          {showAdd ? (
            <div className="rounded-xl border border-dashed border-[#EDEAE2] p-4 space-y-2">
              <input
                value={addTopic}
                onChange={(e) => setAddTopic(e.target.value)}
                placeholder="Topic"
                className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
              />
              <select
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
              >
                {weekDates.map((d) => (
                  <option key={d} value={d}>
                    {formatWeekPlanDayLabel(d, timeZone)}
                  </option>
                ))}
              </select>
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as WeekPlanPostType)}
                className="w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
              >
                {WEEK_PLAN_POST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {WEEK_PLAN_POST_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy || !addTopic.trim()}
                  onClick={() => void addItem()}
                  className="rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-black text-black disabled:opacity-50"
                >
                  Add post
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-[#888]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#886600] hover:underline"
            >
              <Plus className="h-4 w-4" /> Add post
            </button>
          )}
        </>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t border-[#EDEAE2]">
        {!readOnly && (
          <>
            <button
              type="button"
              disabled={busy || items.length === 0}
              onClick={() => void regeneratePlan()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEAE2] py-2.5 text-sm font-bold text-[#444] disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> Regenerate plan
            </button>
            <button
              type="button"
              disabled={busy || items.length === 0}
              onClick={() => void approvePlan()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Approve Plan
            </button>
            <p className="text-center text-[10px] text-[#888]">
              {items.length} posts planned · No render credits charged yet
            </p>
          </>
        )}
        {readOnly && !historyMode && (
          <>
            {planState.generation_status === 'not_started' && onGenerate && (
              <button
                type="button"
                disabled={generateBusy || items.length === 0}
                onClick={onGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black disabled:opacity-50"
              >
                {generateBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                ✨ Generate My Week
              </button>
            )}
            {isPartialFailed && onRetryFailed && (
              <button
                type="button"
                disabled={generateBusy}
                onClick={onRetryFailed}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEAE2] py-2.5 text-sm font-bold text-[#444] disabled:opacity-50"
              >
                Retry failed post{items.filter((i) => i.generation_status === 'failed').length === 1 ? '' : 's'}
              </button>
            )}
            {!structureLocked && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void editPlan()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EDEAE2] py-2.5 text-sm font-bold text-[#444]"
              >
                <Pencil className="h-4 w-4" /> Edit Plan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black"
            >
              Done
            </button>
          </>
        )}
        {historyMode && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
