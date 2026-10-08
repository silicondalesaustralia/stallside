'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, Library, Loader2, Trash2, Upload, X } from 'lucide-react'
import {
  DESIGNED_MAX_VISUALS,
  DESIGNED_VISUAL_MAX_BYTES,
  normalizeDesignedVisualPrimaries,
  type DesignedVisualInput,
  type DesignedVisualRole,
} from '@/lib/social/designedVisualInputs'
import {
  formatPresetLabel,
  type HybridRenderListItem,
} from '@/lib/social/libraryRenderUtils'
import { COMPOSE_STEP_CARD } from '@/lib/social/socialDesignTokens'
import { uploadInspirationTempFile } from '@/lib/social/uploadInspirationTempFile'

export type DesignedSelectedVisual = DesignedVisualInput & {
  clientId: string
  previewUrl: string
  title?: string
}

function sourceLabel(source: DesignedSelectedVisual['source']): string {
  if (source === 'upload') return 'Upload'
  if (source === 'library') return 'Library'
  return 'Job'
}

function toPayload(visuals: DesignedSelectedVisual[]): DesignedVisualInput[] {
  return normalizeDesignedVisualPrimaries(visuals).map((item) => ({
    source: item.source,
    role: item.role,
    isPrimary: item.isPrimary,
    storagePath: item.storagePath,
    libraryRenderId: item.libraryRenderId,
    jobId: item.jobId,
    photoId: item.photoId,
  }))
}

async function uploadVisualFile(file: File): Promise<{ path: string; previewUrl: string; title: string }> {
  if (file.size > DESIGNED_VISUAL_MAX_BYTES) {
    throw new Error(`${file.name}: image too large (max 4 MB).`)
  }
  const uploaded = await uploadInspirationTempFile(file)
  return { path: uploaded.path, previewUrl: uploaded.previewUrl, title: file.name }
}

export function DesignedVisualInputs({
  visuals,
  onChange,
  disabled,
  jobId,
  onRequestJobPhotos,
}: {
  visuals: DesignedSelectedVisual[]
  onChange: (next: DesignedSelectedVisual[]) => void
  disabled?: boolean
  jobId?: string
  onRequestJobPhotos: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const remaining = DESIGNED_MAX_VISUALS - visuals.length

  const commit = useCallback(
    (next: DesignedSelectedVisual[]) => {
      onChange(normalizeDesignedVisualPrimaries(next) as DesignedSelectedVisual[])
    },
    [onChange],
  )

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || disabled) return
    setError(null)
    const files = Array.from(fileList)
    if (files.length > remaining) {
      setError(`You can add up to ${DESIGNED_MAX_VISUALS} visuals.`)
      return
    }
    setUploading(true)
    try {
      const added: DesignedSelectedVisual[] = []
      for (const file of files) {
        const uploaded = await uploadVisualFile(file)
        added.push({
          clientId: crypto.randomUUID(),
          source: 'upload',
          role: 'include',
          isPrimary: false,
          storagePath: uploaded.path,
          previewUrl: uploaded.previewUrl,
          title: uploaded.title,
        })
      }
      commit([...visuals, ...added])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addLibraryItems(items: DesignedSelectedVisual[]) {
    if (items.length + visuals.length > DESIGNED_MAX_VISUALS) {
      setError(`You can add up to ${DESIGNED_MAX_VISUALS} visuals.`)
      return
    }
    const existing = new Set(visuals.map((item) => item.libraryRenderId).filter(Boolean))
    const unique = items.filter((item) => !existing.has(item.libraryRenderId))
    commit([...visuals, ...unique])
    setLibraryOpen(false)
  }

  function updateRole(clientId: string, role: DesignedVisualRole) {
    commit(visuals.map((item) => (item.clientId === clientId ? { ...item, role } : item)))
  }

  function makePrimary(clientId: string) {
    commit(
      visuals.map((item) => ({
        ...item,
        isPrimary: item.clientId === clientId && item.role === 'include',
      })),
    )
  }

  function removeVisual(clientId: string) {
    const target = visuals.find((item) => item.clientId === clientId)
    if (target?.source === 'upload' && target.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl)
    }
    commit(visuals.filter((item) => item.clientId !== clientId))
  }

  function onDropReorder(targetId: string) {
    if (!dragId || dragId === targetId) return
    const next = [...visuals]
    const from = next.findIndex((item) => item.clientId === dragId)
    const to = next.findIndex((item) => item.clientId === targetId)
    if (from < 0 || to < 0) return
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    commit(next)
    setDragId(null)
  }

  return (
    <div className={COMPOSE_STEP_CARD}>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-sm font-black text-[#111]">Add visuals</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[#888]">
            Optional — give the AI real photos or images to use in the design.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
            multiple
            className="sr-only"
            disabled={disabled || remaining <= 0}
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={disabled || remaining <= 0 || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#333] hover:border-[#CCC] disabled:opacity-50"
            data-testid="ai-designed-upload-visuals"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload images
          </button>
          <button
            type="button"
            disabled={disabled || remaining <= 0}
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#333] hover:border-[#CCC] disabled:opacity-50"
            data-testid="ai-designed-library-visuals"
          >
            <Library className="h-3.5 w-3.5" />
            Choose from library
          </button>
          <button
            type="button"
            disabled={disabled || remaining <= 0}
            onClick={onRequestJobPhotos}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0DDD5] bg-white px-3 py-2 text-xs font-semibold text-[#333] hover:border-[#CCC] disabled:opacity-50"
            data-testid="ai-designed-job-visuals"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Use recent job photos
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        )}

        {visuals.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="ai-designed-selected-visuals">
            {visuals.map((visual) => (
              <li
                key={visual.clientId}
                draggable={!disabled}
                onDragStart={() => setDragId(visual.clientId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropReorder(visual.clientId)}
                className="overflow-hidden rounded-xl border border-[#EDEAE2] bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visual.previewUrl}
                  alt={visual.title || sourceLabel(visual.source)}
                  className="aspect-square w-full object-cover"
                />
                <div className="space-y-2 p-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#888]">
                      {sourceLabel(visual.source)}
                    </span>
                    {visual.isPrimary && visual.role === 'include' && (
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black text-indigo-700">
                        Primary
                      </span>
                    )}
                  </div>
                  <fieldset className="space-y-1">
                    <legend className="sr-only">How should we use this?</legend>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#333]">
                      <input
                        type="radio"
                        name={`visual-role-${visual.clientId}`}
                        checked={visual.role === 'include'}
                        disabled={disabled}
                        onChange={() => updateRole(visual.clientId, 'include')}
                      />
                      Include in design
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#333]">
                      <input
                        type="radio"
                        name={`visual-role-${visual.clientId}`}
                        checked={visual.role === 'inspiration'}
                        disabled={disabled}
                        onChange={() => updateRole(visual.clientId, 'inspiration')}
                      />
                      Use as inspiration
                    </label>
                  </fieldset>
                  {visual.role === 'include' && !visual.isPrimary && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => makePrimary(visual.clientId)}
                      className="text-[10px] font-semibold text-indigo-700"
                    >
                      Make primary
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeVisual(visual.clientId)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#888] hover:text-red-600"
                    aria-label={`Remove ${visual.title || sourceLabel(visual.source)}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-[#AAA]">
          Up to {DESIGNED_MAX_VISUALS} images. Logo is separate and does not count.
          {jobId ? '' : ''}
        </p>
      </div>

      {libraryOpen && (
        <DesignedLibraryPicker
          remaining={remaining}
          selectedIds={visuals.map((item) => item.libraryRenderId).filter(Boolean) as string[]}
          onClose={() => setLibraryOpen(false)}
          onAdd={addLibraryItems}
        />
      )}
    </div>
  )
}

function DesignedLibraryPicker({
  remaining,
  selectedIds,
  onClose,
  onAdd,
}: {
  remaining: number
  selectedIds: string[]
  onClose: () => void
  onAdd: (items: DesignedSelectedVisual[]) => void
}) {
  const [renders, setRenders] = useState<HybridRenderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    void fetch('/api/social/hybrid-renders?limit=50&status=completed')
      .then((res) => res.json())
      .then((json: { renders?: HybridRenderListItem[]; error?: string }) => {
        if (cancelled) return
        if (!Array.isArray(json.renders)) throw new Error(json.error || 'Could not load library')
        setRenders(json.renders)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load library')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function toggle(id: string) {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((row) => row !== id)
      if (prev.length >= remaining) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="designed-library-title">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EDEAE2] px-4 py-3">
          <h4 id="designed-library-title" className="text-sm font-black text-[#111]">
            Choose from library
          </h4>
          <button type="button" onClick={onClose} aria-label="Close library picker">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="flex items-center gap-2 text-xs text-[#888]">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading your library…
            </p>
          )}
          {loadError && <p className="text-xs text-red-700">{loadError}</p>}
          {!loading && !loadError && renders.length === 0 && (
            <p className="text-xs text-[#888]">No library images yet.</p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {renders.map((render) => {
              const src = render.result_url || render.photo_url
              if (!src) return null
              const selected = picked.includes(render.id) || selectedIds.includes(render.id)
              const created = render.created_at ? new Date(render.created_at).toLocaleDateString('en-AU') : ''
              return (
                <button
                  key={render.id}
                  type="button"
                  onClick={() => toggle(render.id)}
                  aria-pressed={selected}
                  className={`overflow-hidden rounded-lg border-2 text-left ${
                    selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-[#EDEAE2]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={formatPresetLabel(render.preset)} className="aspect-square w-full object-cover" />
                  <div className="space-y-0.5 px-1.5 py-1">
                    <p className="truncate text-[10px] font-semibold text-[#444]">{formatPresetLabel(render.preset)}</p>
                    <p className="text-[9px] text-[#999]">Library{created ? ` · ${created}` : ''}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#EDEAE2] px-4 py-3">
          <p className="text-[11px] text-[#888]">
            {picked.length} selected · {remaining} remaining
          </p>
          <button
            type="button"
            disabled={!picked.length}
            onClick={() => {
              const items = renders
                .filter((render) => picked.includes(render.id))
                .map((render): DesignedSelectedVisual => ({
                  clientId: crypto.randomUUID(),
                  source: 'library',
                  role: 'include',
                  isPrimary: false,
                  libraryRenderId: render.id,
                  previewUrl: render.result_url || render.photo_url || '',
                  title: formatPresetLabel(render.preset),
                }))
              onAdd(items)
            }}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            Add selected
          </button>
        </div>
      </div>
    </div>
  )
}

export { toPayload as designedVisualsToPayload }
