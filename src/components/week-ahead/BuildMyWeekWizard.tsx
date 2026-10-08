'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { BuildMyWeekWeekSelectStep } from '@/components/week-ahead/BuildMyWeekWeekSelectStep'
import {
  WEEK_PLAN_CONTENT_MIX,
  WEEK_PLAN_DEFAULT_POSTS,
  WEEK_PLAN_MAX_POSTS,
  WEEK_PLAN_MIN_POSTS,
  WEEK_PLAN_PRIORITY_MAX_CHARS,
  type WeekPlanContentMix,
  type WeekPlanItemRow,
  type WeekPlanPlatform,
  type WeekPlanRow,
  type WeekPlanWizardAnswers,
} from '@/lib/social/weekPlan/types'
import { formatWeekRangeHeading } from '@/lib/social/weekPlan/weekIdentity'
import {
  defaultBuildWeekStart,
  initialWeekSelectMode,
  isWeekSelectStepReady,
  normalizeWeekStartMonday,
  occupiedActiveWeekStarts,
  resolveWeekCollision,
  weekStartFromDatePickerValue,
  type ActiveWeekPlanSummary,
  type WeekSelectMode,
} from '@/lib/social/weekPlan/weekPlanWeekSelection'

const CONTENT_MIX_LABELS: Record<WeekPlanContentMix, string> = {
  recent_jobs: 'Recent jobs',
  services: 'Services',
  tips_advice: 'Tips & advice',
  promotions: 'Promotions',
  seasonal: 'Seasonal',
  team_business: 'Team / business',
}

const PLATFORM_LABELS: Record<WeekPlanPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  gmb: 'Google Business Profile',
}

type RecentJob = {
  id: string
  title: string
  suburb: string
}

type Props = {
  timeZone: string
  currentWeekStart: string
  nextWeekStart: string
  activePlans: ActiveWeekPlanSummary[]
  initialSelectedWeekStart?: string | null
  defaultPlatforms: WeekPlanPlatform[]
  initialWizard?: WeekPlanWizardAnswers
  onClose: () => void
  onComplete: (result: { plan: WeekPlanRow; items: WeekPlanItemRow[] }) => void
  onViewPlan: (planId: string) => void
  onContinuePlan: (planId: string) => void
  onEditPlan: (planId: string) => void
}

const STEPS = 5

export function BuildMyWeekWizard({
  timeZone,
  currentWeekStart,
  nextWeekStart,
  activePlans,
  initialSelectedWeekStart,
  defaultPlatforms,
  initialWizard,
  onClose,
  onComplete,
  onViewPlan,
  onContinuePlan,
  onEditPlan,
}: Props) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [pickerDate, setPickerDate] = useState('')

  const defaultWeek = useMemo(
    () =>
      initialSelectedWeekStart ??
      defaultBuildWeekStart(occupiedActiveWeekStarts(activePlans), timeZone),
    [activePlans, initialSelectedWeekStart, timeZone],
  )

  const [selectedWeekStart, setSelectedWeekStart] = useState(defaultWeek)
  const [weekSelectMode, setWeekSelectMode] = useState<WeekSelectMode | null>(() =>
    initialWeekSelectMode(defaultWeek, timeZone),
  )

  useEffect(() => {
    setSelectedWeekStart(defaultWeek)
    setWeekSelectMode(initialWeekSelectMode(defaultWeek, timeZone))
    setPickerDate('')
  }, [defaultWeek, timeZone])

  const effectiveWeekStart =
    weekSelectMode === 'custom' && !pickerDate.trim() ? null : selectedWeekStart

  const collision = useMemo(
    () =>
      effectiveWeekStart
        ? resolveWeekCollision(effectiveWeekStart, activePlans)
        : ({ kind: 'empty' } as const),
    [activePlans, effectiveWeekStart],
  )

  const [postCount, setPostCount] = useState(initialWizard?.postCount ?? WEEK_PLAN_DEFAULT_POSTS)
  const [customCount, setCustomCount] = useState(String(initialWizard?.postCount ?? 4))
  const [chooseForMe, setChooseForMe] = useState(initialWizard?.chooseForMe ?? false)
  const [contentMix, setContentMix] = useState<WeekPlanContentMix[]>(
    initialWizard?.contentMix?.length ? initialWizard.contentMix : [],
  )
  const [priorityText, setPriorityText] = useState(initialWizard?.priorityText ?? '')
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(
    initialWizard?.selectedJobIds ?? [],
  )
  const [platforms, setPlatforms] = useState<WeekPlanPlatform[]>(
    initialWizard?.platforms?.length ? initialWizard.platforms : defaultPlatforms,
  )

  useEffect(() => {
    void fetch('/api/social/week-plan/recent-jobs')
      .then((r) => r.json())
      .then((json) => setRecentJobs(json.jobs ?? []))
      .catch(() => {})
  }, [])

  const effectiveCount =
    postCount === -1
      ? Math.min(WEEK_PLAN_MAX_POSTS, Math.max(WEEK_PLAN_MIN_POSTS, parseInt(customCount, 10) || 4))
      : postCount

  function selectThisWeek() {
    setWeekSelectMode('this_week')
    setPickerDate('')
    setSelectedWeekStart(normalizeWeekStartMonday(currentWeekStart, timeZone))
  }

  function selectNextWeek() {
    setWeekSelectMode('next_week')
    setPickerDate('')
    setSelectedWeekStart(normalizeWeekStartMonday(nextWeekStart, timeZone))
  }

  function selectCustomWeek() {
    setWeekSelectMode('custom')
    setPickerDate('')
  }

  function handlePickerDateChange(value: string) {
    setPickerDate(value)
    if (value) {
      setSelectedWeekStart(weekStartFromDatePickerValue(value, timeZone))
    }
  }

  function toggleMix(key: WeekPlanContentMix) {
    setChooseForMe(false)
    setContentMix((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  function togglePlatform(p: WeekPlanPlatform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  function toggleJob(id: string) {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const canNextStep1 = isWeekSelectStepReady({
    mode: weekSelectMode,
    pickerDate,
    collisionKind: collision.kind,
  })
  const canNextStep2 = effectiveCount >= WEEK_PLAN_MIN_POSTS && effectiveCount <= WEEK_PLAN_MAX_POSTS
  const canNextStep3 = chooseForMe || contentMix.length > 0

  const buildPlan = useCallback(async () => {
    if (collision.kind !== 'empty') return
    setBusy(true)
    try {
      const res = await fetch('/api/social/week-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: selectedWeekStart,
          postCount: effectiveCount,
          chooseForMe,
          contentMix: chooseForMe ? WEEK_PLAN_CONTENT_MIX : contentMix,
          priorityText: priorityText.trim() || null,
          selectedJobIds,
          platforms: platforms.length > 0 ? platforms : defaultPlatforms,
        }),
      })
      const json = await res.json()
      if (res.status === 409 && json.code === 'existing_week_plan') {
        toast('You already have a plan for this week', 'error')
        return
      }
      if (!res.ok) throw new Error(json.error || 'Could not build plan')
      onComplete({ plan: json.plan, items: json.items })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not build plan', 'error')
    } finally {
      setBusy(false)
    }
  }, [
    chooseForMe,
    collision.kind,
    contentMix,
    defaultPlatforms,
    effectiveCount,
    onComplete,
    platforms,
    priorityText,
    selectedJobIds,
    selectedWeekStart,
    toast,
  ])

  const planningLabel = formatWeekRangeHeading(selectedWeekStart, timeZone)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        <div className="border-b border-[#EDEAE2] px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FFD100]" />
              Build My Week
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-[#888] hover:text-[#333]"
            >
              Cancel
            </button>
          </div>
          <p className="mt-1 text-xs text-[#888]">
            Step {step} of {STEPS} · Planning is free
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {step === 1 && (
            <BuildMyWeekWeekSelectStep
              timeZone={timeZone}
              selectedWeekStart={selectedWeekStart}
              currentWeekStart={currentWeekStart}
              nextWeekStart={nextWeekStart}
              weekSelectMode={weekSelectMode}
              collision={collision}
              onSelectThisWeek={selectThisWeek}
              onSelectNextWeek={selectNextWeek}
              onSelectCustomWeek={selectCustomWeek}
              pickerDate={pickerDate}
              onPickerDateChange={handlePickerDateChange}
              onViewPlan={onViewPlan}
              onContinuePlan={onContinuePlan}
              onEditPlan={onEditPlan}
            />
          )}

          {step === 2 && (
            <>
              <h3 className="text-sm font-black text-[#222]">How many posts?</h3>
              <div className="grid grid-cols-2 gap-2">
                {[3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPostCount(n)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                      postCount === n
                        ? 'border-[#FFD100] bg-[#FFFBEA] text-black'
                        : 'border-[#EDEAE2] bg-white text-[#444] hover:border-[#FFD100]/60'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPostCount(-1)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    postCount === -1
                      ? 'border-[#FFD100] bg-[#FFFBEA] text-black'
                      : 'border-[#EDEAE2] bg-white text-[#444] hover:border-[#FFD100]/60'
                  }`}
                >
                  Custom
                </button>
              </div>
              {postCount === -1 && (
                <div>
                  <label className="text-xs font-semibold text-[#666]">
                    Posts ({WEEK_PLAN_MIN_POSTS}-{WEEK_PLAN_MAX_POSTS})
                  </label>
                  <input
                    type="number"
                    min={WEEK_PLAN_MIN_POSTS}
                    max={WEEK_PLAN_MAX_POSTS}
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#E0DDD5] px-3 py-2 text-sm"
                  />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-sm font-black text-[#222]">What should we post about?</h3>
              <div className="space-y-2">
                {WEEK_PLAN_CONTENT_MIX.map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#EDEAE2] px-3 py-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={chooseForMe || contentMix.includes(key)}
                      disabled={chooseForMe}
                      onChange={() => toggleMix(key)}
                      className="accent-[#FFD700]"
                    />
                    <span className="text-sm font-semibold text-[#333]">{CONTENT_MIX_LABELS[key]}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setChooseForMe(true)
                  setContentMix([...WEEK_PLAN_CONTENT_MIX])
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-black transition-colors ${
                  chooseForMe
                    ? 'border-[#FFD100] bg-[#FFFBEA] text-black'
                    : 'border-[#EDEAE2] text-[#444] hover:border-[#FFD100]/60'
                }`}
              >
                ✨ Choose for me
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="text-sm font-black text-[#222]">Anything important this week?</h3>
              <textarea
                value={priorityText}
                onChange={(e) => setPriorityText(e.target.value.slice(0, WEEK_PLAN_PRIORITY_MAX_CHARS))}
                rows={4}
                placeholder="Push heat pump hot water. We completed two installs this week."
                className="w-full rounded-xl border border-[#E0DDD5] px-3 py-2 text-sm text-[#333] focus:border-[#FFD100] focus:outline-none focus:ring-1 focus:ring-[#FFD100]"
              />
              <p className="text-[10px] text-[#AAA] text-right">
                {priorityText.length}/{WEEK_PLAN_PRIORITY_MAX_CHARS}
              </p>
              {recentJobs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#666] mb-2">Recent jobs</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recentJobs.map((job) => (
                      <label
                        key={job.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#EDEAE2] px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedJobIds.includes(job.id)}
                          onChange={() => toggleJob(job.id)}
                          className="accent-[#FFD700]"
                        />
                        <span className="text-sm text-[#333]">
                          {job.title}
                          {job.suburb ? ` - ${job.suburb}` : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <h3 className="text-sm font-black text-[#222]">Where do you usually want these posts?</h3>
              <p className="text-xs text-[#888]">
                This sets your planning intent. You&apos;ll choose final platforms when scheduling later.
              </p>
              <div className="space-y-2 mt-2">
                {(['instagram', 'facebook', 'gmb'] as WeekPlanPlatform[]).map((p) => (
                  <label
                    key={p}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#EDEAE2] px-3 py-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={platforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                      className="accent-[#FFD700]"
                    />
                    <span className="text-sm font-semibold text-[#333]">{PLATFORM_LABELS[p]}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-[#EDEAE2] px-5 py-4 space-y-2">
          {step === STEPS && (
            <p className="text-center text-xs text-[#666]">
              Planning: <span className="font-semibold text-[#111]">{planningLabel}</span>
            </p>
          )}
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-[#EDEAE2] py-2.5 text-sm font-bold text-[#444]"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < STEPS ? (
              <button
                type="button"
                disabled={
                  busy ||
                  (step === 1 && !canNextStep1) ||
                  (step === 2 && !canNextStep2) ||
                  (step === 3 && !canNextStep3)
                }
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || collision.kind !== 'empty'}
                onClick={() => void buildPlan()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFD700] py-2.5 text-sm font-black text-black disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Build My Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
