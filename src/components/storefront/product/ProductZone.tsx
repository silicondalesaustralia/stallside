import type { ProductBlockId, ProductZone as Zone } from "@/lib/studio/product-blocks";
import ProductBlock, { type ProductBlockInfo } from "./ProductBlock";
import ProductZoneEditor from "./ProductZoneEditor";

/** The blocks a seller placed in one zone of the product page; drag-and-drop in the editor. */
export default function ProductZone({
  zone,
  blocks,
  info,
  className = "",
}: {
  zone: Zone;
  blocks: ProductBlockId[];
  info: ProductBlockInfo;
  className?: string;
}) {
  const items = blocks.map((id) => ({ id, node: <ProductBlock id={id} info={info} /> }));
  if (info.isEditing) return <ProductZoneEditor zone={zone} items={items} className={className} />;
  if (!items.length) return null;
  return (
    <div data-pd-zone={zone} className={className}>
      {items.map((item) => (
        <div key={item.id} data-pd-block={item.id}>
          {item.node}
        </div>
      ))}
    </div>
  );
}
