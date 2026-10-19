import type { AdminBlogTopicRow } from "@/lib/blog/admin-queries";
import { setTopicStatusAction, writeTopicNowAction } from "./topic-actions";

export default function AdminBlogTopicActions({ topic }: { topic: AdminBlogTopicRow }) {
  if (topic.status === "SELECTED") {
    return <p className="text-sm font-semibold text-amber-800">Writing…</p>;
  }
  return (
    <div className="flex items-center gap-3">
      {topic.status === "IDEA" ? (
        <form action={writeTopicNowAction}>
          <input type="hidden" name="id" value={topic.id} />
          <button type="submit" className="rounded-full bg-[var(--leaf)] px-3 py-1.5 text-sm font-semibold text-white">
            Write now
          </button>
        </form>
      ) : null}
      <form action={setTopicStatusAction}>
        <input type="hidden" name="id" value={topic.id} />
        <input type="hidden" name="status" value="REJECTED" />
        <button type="submit" className="text-sm font-semibold text-red-700 underline">
          Not interested
        </button>
      </form>
    </div>
  );
}
