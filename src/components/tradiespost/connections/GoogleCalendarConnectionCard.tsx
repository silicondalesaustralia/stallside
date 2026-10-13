'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  TradiesPostConnectionPrimaryButton,
  TradiesPostConnectionSecondaryButton,
  TradiesPostProviderConnectionCard,
} from '@/components/tradiespost/connections/TradiesPostProviderConnectionCard'
import {
  disconnectCalendarAction,
  loadCalendarConnectionsAction,
  syncCalendarNowAction,
  type CalendarConnectionsState,
} from '@/app/dashboard/(gated)/social/connections/calendar-actions'

type Props = { canManageConnections: boolean }

function formatSynced(iso: string | null): string {
  if (!iso) return 'Not synced yet'
  return `Last synced ${new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
}

export default function GoogleCalendarConnectionCard({ canManageConnections }: Props) {
  const [state, setState] = useState<CalendarConnectionsState | null>(null)
  const [busy, setBusy] = useState<'sync' | 'disconnect' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDisconnect, setShowDisconnect] = useState(false)

  useEffect(() => {
    loadCalendarConnectionsAction()
      .then(setState)
      .catch((err: unknown) => {
        console.error('[Google Calendar card]', err)
        setError('Could not load calendar connection.')
      })
  }, [])

  async function run(kind: 'sync' | 'disconnect', action: () => Promise<CalendarConnectionsState>) {
    setBusy(kind)
    setError(null)
    try {
      setState(await action())
    } catch (err) {
      console.error('[Google Calendar card]', err)
      setError(kind === 'sync' ? 'Sync failed. Try again shortly.' : 'Could not disconnect.')
    } finally {
      setBusy(null)
      setShowDisconnect(false)
    }
  }

  const conn = state?.connections.find((c) => c.provider === 'GOOGLE') ?? null
  const enabled = state?.googleEnabled ?? false
  const beginConnect = () => window.location.assign('/api/calendar/connect/google')
  const problem = error ?? conn?.lastError ?? null

  return (
    <>
      <TradiesPostProviderConnectionCard
        testId="tp-connection-google-calendar"
        name="Google Calendar"
        benefit="See your own appointments on the Vendl calendar, and get pickups, order cut-offs and markets in a “Vendl” calendar on your phone."
        icon={<Calendar className="h-6 w-6 text-[#4285F4]" aria-hidden />}
        status={conn ? 'connected' : enabled ? 'not_connected' : 'coming_soon'}
        connectedDetail={conn ? `${conn.accountEmail ?? 'Google account'} · ${formatSynced(conn.lastSyncAt)}` : undefined}
        statusBlock={
          problem ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800">{problem}</p>
          ) : null
        }
        primaryAction={
          !conn && enabled && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton onClick={beginConnect}>
              Connect Google Calendar
            </TradiesPostConnectionPrimaryButton>
          ) : conn && canManageConnections ? (
            <TradiesPostConnectionPrimaryButton
              onClick={() => void run('sync', syncCalendarNowAction)}
              disabled={busy !== null}
            >
              {busy === 'sync' ? 'Syncing…' : 'Sync now'}
            </TradiesPostConnectionPrimaryButton>
          ) : null
        }
        secondaryAction={
          conn && canManageConnections ? (
            <div className="flex flex-wrap items-center gap-3">
              {enabled && (
                <TradiesPostConnectionSecondaryButton onClick={beginConnect}>Reconnect</TradiesPostConnectionSecondaryButton>
              )}
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setShowDisconnect(true)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          ) : null
        }
      />

      <Modal open={showDisconnect} onClose={() => setShowDisconnect(false)} title="Disconnect Google Calendar?">
        <p className="mb-6 text-sm text-zinc-600">
          Vendl will stop showing your Google events and stop updating the “Vendl” calendar in Google. You can delete
          that calendar in Google Calendar if you no longer want it.
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setShowDisconnect(false)} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => void run('disconnect', () => disconnectCalendarAction('GOOGLE'))}
            disabled={busy !== null}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {busy === 'disconnect' ? 'Disconnecting…' : 'Disconnect'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
