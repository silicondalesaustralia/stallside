import type { StudioSectionType } from "@/lib/studio/types";

/** [x, y, width, height, tone] on a 40×28 grid. tone 1 = accent, 0 = muted. */
type Shape = [number, number, number, number, 0 | 1];

const GRID: Shape[] = [
  [3, 4, 10, 9, 0], [15, 4, 10, 9, 0], [27, 4, 10, 9, 0],
  [3, 15, 10, 9, 0], [15, 15, 10, 9, 0], [27, 15, 10, 9, 0],
];

const SHAPES: Record<StudioSectionType, Shape[]> = {
  CraftHeroSection: [[2, 2, 36, 24, 0], [6, 9, 20, 3, 1], [6, 14, 14, 2, 0], [6, 19, 9, 3, 1]],
  CraftProductGridSection: GRID,
  CraftCategoriesSection: [[3, 7, 16, 14, 0], [21, 7, 16, 14, 0], [6, 17, 8, 2, 1], [24, 17, 8, 2, 1]],
  CraftNextDropSection: [[3, 4, 34, 20, 0], [7, 8, 12, 12, 1], [22, 9, 12, 3, 1], [22, 15, 9, 2, 0]],
  CraftTextSection: [[6, 6, 22, 3, 1], [6, 12, 28, 2, 0], [6, 16, 28, 2, 0], [6, 20, 18, 2, 0]],
  CraftImageSection: [[4, 4, 32, 20, 0], [14, 10, 12, 8, 1]],
  CraftImageTextSection: [[3, 4, 16, 20, 0], [22, 8, 14, 3, 1], [22, 14, 14, 2, 0], [22, 18, 10, 2, 0]],
  CraftAboutSection: [[8, 5, 24, 3, 1], [5, 11, 30, 2, 0], [5, 15, 30, 2, 0], [5, 19, 20, 2, 0]],
  CraftReviewsSection: [[3, 7, 10, 14, 0], [15, 7, 10, 14, 0], [27, 7, 10, 14, 0], [5, 9, 6, 2, 1], [17, 9, 6, 2, 1], [29, 9, 6, 2, 1]],
  CraftPickupSection: [[3, 6, 16, 16, 0], [21, 6, 16, 16, 0], [6, 10, 6, 6, 1], [24, 10, 6, 6, 1]],
  CraftSignupSection: [[6, 6, 28, 3, 1], [6, 14, 18, 6, 0], [26, 14, 8, 6, 1]],
  CraftFarmStandSection: [[3, 4, 18, 20, 0], [24, 7, 12, 3, 1], [24, 13, 12, 2, 0], [24, 17, 8, 2, 0]],
  CraftProductDetailSection: [[3, 4, 18, 20, 0], [24, 5, 12, 3, 1], [24, 11, 10, 2, 0], [24, 18, 12, 4, 1]],
  CraftMenuDetailSection: [[5, 4, 30, 3, 1], [5, 10, 30, 3, 0], [5, 15, 30, 3, 0], [5, 20, 30, 3, 0]],
};

export default function SectionThumbnail({ type }: { type: StudioSectionType }) {
  return (
    <svg viewBox="0 0 40 28" width={40} height={28} aria-hidden className="shrink-0 rounded border border-[var(--line)] bg-white">
      {SHAPES[type].map(([x, y, w, h, tone], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1}
          fill={tone ? "var(--leaf-dark, #2f6b3a)" : "#e7e5e4"}
        />
      ))}
    </svg>
  );
}
