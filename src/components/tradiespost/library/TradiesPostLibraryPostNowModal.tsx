'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  SOCIAL_PUBLISH_PLATFORM_LABELS,
  SOCIAL_PUBLISH_PLATFORMS,
  connectedPlatformList,
  defaultLibrarySelectedPlatforms,
  toggleLibraryPlatform,
  type SocialConnectionState,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'

type TradiesPostLibraryPostNowModalProps = {
  open: boolean
  onClose: () => void
  connected: SocialConnectionState
  submitting?: boolean
  error?: string | null
  onConfirm: (platforms: SocialPublishPlatform[]) => void
}

export function TradiesPostLibraryPostNowModal({
  open,
  onClose,
  connected,
  submitting = false,
  error = null,
  onConfirm,
}: TradiesPostLibraryPostNowModalProps) {
  const connectedList = connectedPlatformList(connected)
  const [selected, setSelected] = useState<SocialPublishPlatform[]>(() =>
    defaultLibrarySelectedPlatforms(connected),
  )

  useEffect(() => {
    if (!open) return
    setSelected(defaultLibrarySelectedPlatforms(connected))
  }, [open, connected])

  const canSubmit = selected.some((p) => connected[p]) && !submitting

  return (
    <Modal open={open} onClose={() => { if (!submitting) onClose() }} title="Post now">
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">
          Choose where to publish. Only connected accounts are listed.
        </p>

        {connectedList.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Connect Facebook, Instagram, or Google Business first.
          </p>
        ) : (
          <div className="space-y-2">
            {SOCIAL_PUBLISH_PLATFORMS.filter((p) => connected[p]).map((platform) => (
              <label
                key={platform}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(platform)}
                  disabled={submitting}
                  onChange={() => setSelected((prev) => toggleLibraryPlatform(prev, platform))}
                  className="accent-[#F5C518]"
                />
                <span className="font-semibold text-zinc-800">
                  {SOCIAL_PUBLISH_PLATFORM_LABELS[platform]}
                </span>
              </label>
            ))}
            <button
              type="button"
              disabled={submitting}
              onClick={() => setSelected(defaultLibrarySelectedPlatforms(connected))}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800"
            >
              Select all connected
            </button>
          </div>
        )}

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" disabled={submitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => onConfirm(selected.filter((p) => connected[p]))}
            className="bg-[#18181B] text-white hover:bg-zinc-800"
          >
            {submitting ? 'Posting…' : 'Post now'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
