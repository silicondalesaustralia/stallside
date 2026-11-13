'use client'

import { Loader2, X } from 'lucide-react'

type Props = {
  /** True once the queued post has been seen and nothing is waiting any more. */
  finished: boolean
  onDismiss: () => void
}

export function PostsQueueNotice({ finished, onDismiss }: Props) {
  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-2xl border border-[#F5C518] bg-[#FFF8DB] p-4"
      role="status"
      data-testid="posts-queue-notice"
    >
      {!finished && <Loader2 className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin text-[#18181B]" />}
      <div className="flex-1 text-sm text-[#18181B]">
        <p className="font-bold">
          {finished ? 'Your post has finished publishing.' : 'Your post is now in the queue.'}
        </p>
        <p className="mt-0.5 text-zinc-600">
          {finished
            ? 'Check the result below.'
            : 'You can click away if you wish. We will keep posting in the background and this page updates when it is done.'}
        </p>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-zinc-500 hover:text-zinc-800">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
