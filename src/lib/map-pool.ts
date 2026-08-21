/** Run async work over items with a fixed concurrency limit. */
export async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  let next = 0;

  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index]!, index);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => run()));
}
