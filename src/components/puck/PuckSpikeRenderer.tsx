import { Render } from "@puckeditor/core/rsc";
import {
  puckSpikeConfig,
  type PuckSpikeComponents,
} from "@/lib/puck/spike-config";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import type { Data } from "@puckeditor/core";

export default function PuckSpikeRenderer({
  data,
  metadata,
}: {
  data: Data;
  metadata: PuckSpikeMetadata;
}) {
  return (
    <Render
      config={puckSpikeConfig}
      data={data as Data<PuckSpikeComponents>}
      metadata={metadata}
    />
  );
}
