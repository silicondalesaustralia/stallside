'use client'

import { useState } from 'react'
import { CheckCircle2, Upload, Video } from 'lucide-react'
import { LibraryVideoUploadModal } from '@/components/social/LibraryVideoUploadModal'
import { CREATE_VIDEO_BULLETS } from '@/lib/social/socialCreateModes'

type Props = {
  onViewLibrary?: () => void
  onUploadComplete?: () => void
}

export function CreateVideoWorkspace({ onViewLibrary, onUploadComplete }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div
      className="rounded-2xl border border-[#EDEAE2]/80 bg-white p-6 shadow-sm sm:p-8"
      data-testid="create-video-workspace"
    >
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111] text-white">
          <Video className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="text-xl font-black text-black">Create a video post</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#666]">
          Upload a real video of your products or stall and turn it into ready-to-use social content.
        </p>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3.5 text-sm font-black text-black hover:bg-yellow-400 sm:w-auto"
          data-testid="create-video-upload-button"
        >
          <Upload className="h-4 w-4" />
          Upload video
        </button>

        <ul className="mt-6 space-y-2 text-left text-sm text-[#666]">
          {CREATE_VIDEO_BULLETS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD700]" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <LibraryVideoUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onComplete={() => onUploadComplete?.()}
        onViewLibrary={onViewLibrary}
      />
    </div>
  )
}
