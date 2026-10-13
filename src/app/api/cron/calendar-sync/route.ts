import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncCalendarExports } from '@/lib/calendar-sync/export'

export const maxDuration = 300

// Runs hourly via Vercel Cron (see vercel.json).
// Pushes each owner's Vendl schedule to their connected calendars; unchanged events are skipped.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const owners = await prisma.calendarConnection.findMany({
      where: { exportEnabled: true },
      select: { ownerId: true },
      distinct: ['ownerId'],
    })
    for (const { ownerId } of owners) {
      await syncCalendarExports(ownerId)
    }
    console.log('[Cron calendar-sync]', { owners: owners.length })
    return NextResponse.json({ ok: true, owners: owners.length })
  } catch (err) {
    console.error('[Cron calendar-sync] Failed', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
