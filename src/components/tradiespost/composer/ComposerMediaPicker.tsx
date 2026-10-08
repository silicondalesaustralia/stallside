'use client'

import { useRef, useState, type ReactNode } from 'react'
import { ImageIcon, Loader2, Sparkles, Upload, Video } from 'lucide-react'
import { ComposerLibraryPicker } from '@/components/tradiespost/composer/ComposerLibraryPicker'
import { ComposerMediaPreviewThumb } from '@/components/tradiespost/composer/ComposerMediaPreviewThumb'
import { ComposerVideoNotice } from '@/components/tradiespost/composer/ComposerVideoNotice'
import { ComposerVideoPicker } from '@/components/tradiespost/composer/ComposerVideoPicker'
import type { ComposerMedia } from '@/components/tradiespost/composer/useComposerMedia'
import { isAiPhotoSource } from '@/lib/tradiespost/composer/composerState'

type Props = {
  media: ComposerMedia | null
  uploading: boolean
  uploadError: string | null
  onUpload: (file: File) => void
  onSelectLibrary: (media: ComposerMedia) => void
  onOpenAi: () => void
  onRemove: () => void
  /** Extra photo-mode content (TikTok slides) rendered below the picker. */
  photoExtras?: ReactNode
}

const sourceBtn =
  'flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-[#E4E4E7] bg-white px-3 py-3 text-sm font-bold text-[#18181B] transition-colors hover:border-[#F5C518] disabled:opacity-50'

export function ComposerMediaPicker(props: Props) {
  const { media, uploading, uploadError, onUpload, onSelectLibrary, onOpenAi, onRemove, photoExtras } = props
  const [kind, setKind] = useState<'photo' | 'video'>('photo')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [videoRefresh, setVideoRefresh] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div data-testid="composer-media">
      <div className="mb-3 inline-flex rounded-xl border border-[#E4E4E7] bg-white p-1">
        {(['photo', 'video'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k)
              if (media && Boolean(media.video) !== (k === 'video')) onRemove()
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-bold ${
              kind === k ? 'bg-[#18181B] text-white' : 'text-zinc-600'
            }`}
          >
            {k === 'photo' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {k === 'photo' ? 'Photo' : 'Video'}
          </button>
        ))}
      </div>

      {kind === 'video' && media?.video && (
        <ComposerMediaPreviewThumb
          imageUrl={media.url}
          aiGenerated={false}
          onReplace={onRemove}
          onRemove={onRemove}
        />
      )}

      {kind === 'video' && !media?.video && (
        <>
          <ComposerVideoPicker refreshKey={videoRefresh} onSelect={onSelectLibrary} />
          <ComposerVideoNotice onUploaded={() => setVideoRefresh((n) => n + 1)} />
        </>
      )}

      {kind === 'photo' && media && !libraryOpen && (
        <ComposerMediaPreviewThumb
          imageUrl={media.url}
          aiGenerated={media.aiGenerated}
          onReplace={() => setLibraryOpen(true)}
          onRemove={onRemove}
        />
      )}

      {kind === 'photo' && libraryOpen && (
        <ComposerLibraryPicker
          onCancel={() => setLibraryOpen(false)}
          onSelect={(render) => {
            onSelectLibrary({
              url: render.result_url,
              renderId: render.id,
              aiGenerated: isAiPhotoSource(render.photo_source),
            })
            setLibraryOpen(false)
          }}
        />
      )}

      {kind === 'photo' && !media && !libraryOpen && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button type="button" className={sourceBtn} disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          <button type="button" className={sourceBtn} onClick={() => setLibraryOpen(true)}>
            <ImageIcon className="h-5 w-5" />
            From Library
          </button>
          <button
            type="button"
            className={`${sourceBtn} border-[#F5C518] bg-[#FFF8DB]`}
            onClick={onOpenAi}
            data-testid="composer-open-ai"
          >
            <Sparkles className="h-5 w-5" />
            Create with AI
            <span className="text-[10px] font-semibold text-zinc-500">Uses render credits</span>
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
      />
      {uploadError && <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>}
      {kind === 'photo' && photoExtras}
    </div>
  )
}
