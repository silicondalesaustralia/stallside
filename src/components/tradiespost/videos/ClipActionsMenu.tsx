'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Download, FileText, MoreVertical, Scissors, Send } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { VIDEO_ASSET_QUERY_PARAM } from '@/components/tradiespost/composer/useVideoAssetFromQuery'
import { downloadClipScript } from './clipScriptExport'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'

type Props = {
  clipId: string
  downloadUrl: string | null
  disabled?: boolean
  onEdit: () => void
}

const itemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-tradiespost-text hover:bg-zinc-50'

export function ClipActionsMenu({ clipId, downloadUrl, disabled, onEdit }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  function downloadScript() {
    setOpen(false)
    downloadClipScript(clipId)
      .then(() => toast('Script downloaded', 'success'))
      .catch((err: unknown) => toast(err instanceof Error ? err.message : 'Could not download the script', 'error'))
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-tradiespost-border text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
        aria-label="Clip actions"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg" role="menu">
          <Link href={`${SOCIAL_PATHS.create}?${VIDEO_ASSET_QUERY_PARAM}=${encodeURIComponent(clipId)}`} className={itemClass} role="menuitem">
            <Send className="h-4 w-4" aria-hidden /> Post to social
          </Link>
          <button type="button" className={itemClass} role="menuitem" onClick={() => { setOpen(false); onEdit() }}>
            <Scissors className="h-4 w-4" aria-hidden /> Edit clip
          </button>
          {downloadUrl ? (
            <a href={downloadUrl} download target="_blank" rel="noopener noreferrer" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
              <Download className="h-4 w-4" aria-hidden /> Download
            </a>
          ) : null}
          <button type="button" className={itemClass} role="menuitem" onClick={downloadScript}>
            <FileText className="h-4 w-4" aria-hidden /> Download script
          </button>
        </div>
      ) : null}
    </div>
  )
}
