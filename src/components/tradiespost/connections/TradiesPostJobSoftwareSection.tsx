'use client'

import { TradiesPostSectionTitle } from '@/components/tradiespost/ui/TradiesPostTypography'
import { TradiesPostStatusBadge } from '@/components/tradiespost/ui/TradiesPostStatusBadge'

const JOB_SOFTWARE_PROVIDERS = [
  {
    id: 'servicem8',
    name: 'ServiceM8',
    description: 'Turn completed ServiceM8 jobs and job photos into social content.',
  },
  {
    id: 'tradify',
    name: 'Tradify',
    description: 'Pull finished jobs and site photos into your content library automatically.',
  },
  {
    id: 'fergus',
    name: 'Fergus',
    description: 'Sync completed work and job details for faster social posts.',
  },
  {
    id: 'simpro',
    name: 'simPRO',
    description: 'Bring job completion data and photos into Vendl.',
  },
  {
    id: 'aroflo',
    name: 'AroFlo',
    description: 'Connect field job outcomes to your social content workflow.',
  },
] as const

export function TradiesPostJobSoftwareSection() {
  return (
    <section className="mt-12" data-testid="tp-job-software-section">
      <TradiesPostSectionTitle className="mb-1">Job software</TradiesPostSectionTitle>
      <p className="mb-5 text-sm text-zinc-600">
        Bring completed work into Vendl automatically.
      </p>

      <div className="job-software-grid">
        {JOB_SOFTWARE_PROVIDERS.map((provider) => (
          <article key={provider.id} className="job-software-card">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-500">
                {provider.name.slice(0, 2).toUpperCase()}
              </div>
              <TradiesPostStatusBadge status="coming_soon" label="Coming soon" dot />
            </div>
            <h3 className="text-sm font-black text-[#18181B]">{provider.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">{provider.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
