import { z } from "zod";
import { PRODUCT_BLOCKS } from "./product-blocks";

const zoneList = z.array(z.enum(PRODUCT_BLOCKS)).max(PRODUCT_BLOCKS.length);
export const blockLayoutSchema = z.object({ photo: zoneList, details: zoneList, below: zoneList });
