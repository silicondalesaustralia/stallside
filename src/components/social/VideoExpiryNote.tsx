import { daysUntilLibraryR2Expiry } from '@/lib/social/libraryVideoR2'

export function VideoExpiryNote({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return null
  const days = daysUntilLibraryR2Expiry(expiresAt)
  const label = days <= 1 ? 'Deleted within a day' : `Deleted in ${days} days`
  return (
    <p className="text-[10px] font-semibold text-[#B45309]" title="Large videos are kept for 7 days. Download it to keep a copy.">
      {label} · download to keep a copy
    </p>
  )
}
