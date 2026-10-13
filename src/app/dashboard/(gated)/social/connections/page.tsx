import ConnectionsView from '@/components/tradiespost/connections/ConnectionsView'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'

export default function SocialConnectionsPage() {
  return <ConnectionsView integrationsPath={SOCIAL_PATHS.connections} />
}
