'use client'

import { TradiesPostSelectableCard } from '@/components/tradiespost/ui/TradiesPostSelectableCard'
import {
  formatWeekRangeCompact,
  formatWeekRangeHeading,
} from '@/lib/social/weekPlan/weekIdentity'
import {
  formatWeekPickerHint,
  type WeekCollisionState,
  type WeekSelectMode,
} from '@/lib/social/weekPlan/weekPlanWeekSelection'

type Props = {
  timeZone: string
  selectedWeekStart: string
  currentWeekStart: string
  nextWeekStart: string
  weekSelectMode: WeekSelectMode | null
  collision: WeekCollisionState
  onSelectThisWeek: () => void
  onSelectNextWeek: () => void
  onSelectCustomWeek: () => void
  pickerDate: string
  onPickerDateChange: (value: string) => void
  onViewPlan: (planId: string) => void
  onContinuePlan: (planId: string) => void
  onEditPlan: (planId: string) => void
}

function WeekOption({
  label,
  range,
  helper,
  selected,
  onClick,
}: {
  label: string
  range?: string
  helper?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <TradiesPostSelectableCard
      selected={selected}
      onClick={onClick}
      className="rounded-xl px-4 py-3 pr-10"
      ariaLabel={range ? `${label}, ${range}` : label}
    >
      <p className="text-sm font-bold text-[#18181B]">{label}</p>
      {range && <p className="mt-0.5 text-xs text-[#6B6B73]">{range}</p>}
      {helper && <p className="mt-0.5 text-xs text-[#6B6B73]">{helper}</p>}
    </TradiesPostSelectableCard>
  )
}

export function BuildMyWeekWeekSelectStep({
  timeZone,
  selectedWeekStart,
  currentWeekStart,
  nextWeekStart,
  weekSelectMode,
  collision,
  onSelectThisWeek,
  onSelectNextWeek,
  onSelectCustomWeek,
  pickerDate,
  onPickerDateChange,
  onViewPlan,
  onContinuePlan,
  onEditPlan,
}: Props) {
  const customResolved = weekSelectMode === 'custom' && Boolean(pickerDate.trim())
  const selectedRange = formatWeekRangeHeading(selectedWeekStart, timeZone)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#18181B]">Which week are you planning?</h3>
        <p className="mt-1 text-xs text-[#6B6B73]">
          Planning ahead? You can have multiple weeks in progress at once.
        </p>
      </div>

      <div className="space-y-2">
        <WeekOption
          label="This week"
          range={formatWeekRangeCompact(currentWeekStart, timeZone)}
          selected={weekSelectMode === 'this_week'}
          onClick={onSelectThisWeek}
        />
        <WeekOption
          label="Next week"
          range={formatWeekRangeCompact(nextWeekStart, timeZone)}
          selected={weekSelectMode === 'next_week'}
          onClick={onSelectNextWeek}
        />
        <WeekOption
          label="Choose a week"
          helper="Pick any date in the week you want to plan"
          selected={weekSelectMode === 'custom'}
          onClick={onSelectCustomWeek}
        />
      </div>

      {weekSelectMode === 'custom' && (
        <div className="space-y-2 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2] p-3">
          <label htmlFor="build-week-date" className="text-xs font-semibold text-[#6B6B73]">
            Pick any date in the week you want to plan
          </label>
          <input
            id="build-week-date"
            type="date"
            value={pickerDate}
            onChange={(e) => onPickerDateChange(e.target.value)}
            className="w-full rounded-lg border border-[#E8E6E1] bg-white px-3 py-2 text-sm text-[#18181B]"
          />
          <p className="text-xs text-[#6B6B73]">We&apos;ll automatically plan Monday to Sunday.</p>
          {customResolved && (
            <>
              <p className="text-xs text-[#6B6B73]">
                {formatWeekPickerHint(pickerDate, timeZone)}
              </p>
              <p className="text-xs font-semibold text-[#18181B]">
                Selected week: {selectedRange}
              </p>
            </>
          )}
        </div>
      )}

      {collision.kind === 'draft' && (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-[#664]">
            You already started a plan for {formatWeekRangeCompact(selectedWeekStart, timeZone)}.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onContinuePlan(collision.planId)}
              className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white"
            >
              Continue plan
            </button>
            <button
              type="button"
              onClick={() => onViewPlan(collision.planId)}
              className="rounded-lg border border-[#E8E6E1] bg-white px-3 py-2 text-xs font-bold text-[#444]"
            >
              View week
            </button>
          </div>
        </div>
      )}

      {collision.kind === 'approved' && (
        <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-900">
            This week is already planned ({formatWeekRangeCompact(selectedWeekStart, timeZone)}).
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onViewPlan(collision.planId)}
              className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white"
            >
              View week
            </button>
            <button
              type="button"
              onClick={() => onEditPlan(collision.planId)}
              className="rounded-lg border border-[#E8E6E1] bg-white px-3 py-2 text-xs font-bold text-[#444]"
            >
              Edit plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
