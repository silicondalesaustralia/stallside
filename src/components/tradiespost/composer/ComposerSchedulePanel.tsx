'use client'

import { quickPicks, type ComposerMode } from '@/lib/tradiespost/composer/composerState'

type Props = {
  mode: ComposerMode
  onMode: (mode: ComposerMode) => void
  date: string
  time: string
  onDate: (value: string) => void
  onTime: (value: string) => void
  businessTz: string
  tzMismatch: boolean
  manualSchedule: boolean
}

export function ComposerSchedulePanel(props: Props) {
  const { mode, onMode, date, time, onDate, onTime, businessTz, tzMismatch, manualSchedule } = props
  const picks = quickPicks()

  return (
    <div data-testid="composer-schedule">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#E4E4E7] bg-white p-1">
        {(['now', 'schedule'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMode(m)}
            className={`rounded-lg py-2 text-sm font-bold ${
              mode === m ? 'bg-[#18181B] text-white' : 'text-zinc-600'
            }`}
          >
            {m === 'now' ? 'Post now' : 'Schedule'}
          </button>
        ))}
      </div>

      {mode === 'schedule' && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {picks.map((p) => {
              const active = date === p.date && time === p.time
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onDate(p.date)
                    onTime(p.time)
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    active ? 'border-[#F5C518] bg-[#FFF8DB]' : 'border-[#E4E4E7] bg-white text-zinc-600'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] font-semibold text-zinc-500">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => onDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E4E4E7] bg-white px-2 py-2 text-sm text-[#18181B]"
              />
            </label>
            <label className="text-[11px] font-semibold text-zinc-500">
              Time
              <input
                type="time"
                value={time}
                onChange={(e) => onTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E4E4E7] bg-white px-2 py-2 text-sm text-[#18181B]"
              />
            </label>
          </div>
          <p className="text-[11px] text-zinc-500">Times are for {businessTz}.</p>
          {tzMismatch && (
            <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
              Your device is set to a different timezone from your business. The post will go out at this
              time on your device&apos;s clock.
            </p>
          )}
          {manualSchedule && (
            <p className="rounded-lg bg-[#FAFAFA] px-2.5 py-2 text-[11px] text-zinc-600">
              Some selected platforms aren&apos;t connected, so this goes on your calendar to post yourself.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
