import type { VideoSourceListItem } from '@/lib/social/videoClips/types'

const STAGE_LABELS: Record<string, string> = {
  downloading: 'Getting your video ready…',
  transcribing: 'Listening to the video…',
  selecting: 'Picking the best moments…',
  cutting: 'Cutting clips…',
  preparing: 'Preparing your video for the editor…',
}

export function clipJobStatusLabel(
  job: VideoSourceListItem['latestJob'],
): { text: string; tone: string } | null {
  if (!job) return null
  switch (job.status) {
    case 'pending':
      return { text: 'Queued — clipping starts shortly', tone: 'text-zinc-600' }
    case 'processing': {
      const stage = (job.progressStage && STAGE_LABELS[job.progressStage]) || 'Working on it…'
      const made = job.clipsCreated > 0 ? ` (${job.clipsCreated} done)` : ''
      return { text: `${stage}${made}`, tone: 'text-zinc-600' }
    }
    case 'completed':
      return {
        text: `${job.clipsCreated} clip${job.clipsCreated === 1 ? '' : 's'} saved to your Library`,
        tone: 'text-emerald-700',
      }
    case 'failed':
      return {
        text:
          job.clipsCreated > 0
            ? `Stopped after ${job.clipsCreated} clips — try again for more`
            : 'Clipping failed — please try again',
        tone: 'text-red-600',
      }
    default:
      return null
  }
}
