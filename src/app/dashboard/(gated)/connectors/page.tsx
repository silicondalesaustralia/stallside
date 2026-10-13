import ConnectionsView from '@/components/tradiespost/connections/ConnectionsView'
import { CONNECTORS_PATH } from '@/lib/socialHost/hostConfig'

export default function ConnectorsPage() {
  return <ConnectionsView integrationsPath={CONNECTORS_PATH} />
}
