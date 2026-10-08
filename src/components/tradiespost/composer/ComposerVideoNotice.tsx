'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { LibraryVideoUploadModal } from '@/components/social/LibraryVideoUploadModal'

export function ComposerVideoNotice({ onUploaded }: { onUploaded?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-dashed border-[#E4E4E7] bg-[#FAFAFA] p-5 text-center">
      <p className="text-sm font-bold text-[#18181B]">Videos go to your Library first</p>
      <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
        Upload an MP4 or MOV up to 60 seconds, then pick it above. Videos post automatically to TikTok.
        For other platforms, download it from your Library and post it yourself.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#F5C518] px-4 py-2 text-sm font-black text-[#18181B]"
      >
        <Upload className="h-4 w-4" /> Upload video
      </button>
      <LibraryVideoUploadModal
        open={open}
        onClose={() => setOpen(false)}
        onComplete={() => {
          setOpen(false)
          onUploaded?.()
        }}
        onViewLibrary={() => router.push('/dashboard/social/library')}
      />
    </div>
  )
}
