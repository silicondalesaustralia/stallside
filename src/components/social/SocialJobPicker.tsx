'use client'

import { useEffect, useState } from 'react'

export type SocialJobOption = {
  id: string
  title: string
  suburb: string | null
  label: string
}

type Props = {
  value: string | null
  onChange: (jobId: string | null, option: SocialJobOption | null) => void
  disabled?: boolean
  id?: string
  helperText?: string
}

export function SocialJobPicker({
  value,
  onChange,
  disabled,
  id = 'social-job-picker',
  helperText = 'Linking a job helps StitchedUp write a more relevant caption.',
}: Props) {
  const [jobs, setJobs] = useState<SocialJobOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/social/completed-jobs?scope=recent')
        const json = await res.json().catch(() => ({}))
        if (!res.ok || cancelled) return

        const options: SocialJobOption[] = (json.jobs ?? []).map(
          (job: { id: string; title?: string | null; site_suburb?: string | null }) => {
            const title = job.title?.trim() || 'Job'
            const suburb = job.site_suburb?.trim() || null
            return {
              id: job.id,
              title,
              suburb,
              label: suburb ? `${title} · ${suburb}` : title,
            }
          },
        )
        setJobs(options)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const selected = jobs.find((j) => j.id === value) ?? null

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#666]">
        Related job <span className="font-normal text-[#AAA]">(optional)</span>
      </label>
      <select
        id={id}
        disabled={disabled || loading}
        value={value ?? ''}
        onChange={(e) => {
          const nextId = e.target.value || null
          const option = nextId ? jobs.find((j) => j.id === nextId) ?? null : null
          onChange(nextId, option)
        }}
        className="min-h-[44px] w-full rounded-xl border border-[#EDEAE2] bg-white px-3 py-2.5 text-sm text-[#444] outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] disabled:opacity-60"
        data-testid="social-job-picker"
      >
        <option value="">{loading ? 'Loading jobs…' : 'No related job'}</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="mt-1.5 text-xs text-[#888]">{helperText}</p> : null}
      {selected ? (
        <p className="mt-2 rounded-lg bg-[#FAFAF8] px-3 py-2 text-xs font-semibold text-[#555]">
          {selected.title}
          {selected.suburb ? (
            <>
              <br />
              <span className="font-normal text-[#888]">{selected.suburb}</span>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
