/** Copy of `list` with the item at `index` swapped one place up (-1) or down (1); out-of-range moves change nothing. */
export function moveItem<T>(list: readonly T[], index: number, direction: -1 | 1): T[] {
  const to = index + direction;
  const next = [...list];
  if (index < 0 || to < 0 || to >= list.length) return next;
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
