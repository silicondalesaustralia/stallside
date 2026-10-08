import { redirect } from 'next/navigation'

/** Older social components link to /social?tab=...; map those onto the /social/* pages. */
const TAB_TO_PATH: Record<string, string> = {
  create: '/dashboard/social/create',
  library: '/dashboard/social/library',
  planner: '/dashboard/social/planner',
  calendar: '/dashboard/social/calendar',
  scheduled: '/dashboard/social/calendar',
  published: '/dashboard/social/posts',
  posts: '/dashboard/social/posts',
  help: '/dashboard/social/create',
}

export default async function SocialIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const tab = typeof params.tab === 'string' ? params.tab : 'create'
  const rest = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'tab' && typeof value === 'string') rest.set(key, value)
  }
  const query = rest.toString()
  redirect(`${TAB_TO_PATH[tab] ?? '/dashboard/social/create'}${query ? `?${query}` : ''}`)
}
