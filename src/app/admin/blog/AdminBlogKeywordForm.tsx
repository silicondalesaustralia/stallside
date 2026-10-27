import { dashCtaClass } from "@/components/DashPrimaryCta";
import { writeFromKeywordAction } from "./topic-actions";

const fieldClass =
  "rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

export default function AdminBlogKeywordForm() {
  return (
    <form action={writeFromKeywordAction} className="dash-card flex flex-col gap-3 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">Write a post from a keyword</h2>
        <p className="text-sm text-[var(--muted)]">
          Runs the full daily process for one post: search demand, angle, Vendl tie-in, research, images. The draft
          lands in the review queue in about 15–25 minutes.
        </p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Keyword or phrase</span>
          <input name="keyword" required minLength={5} maxLength={200} placeholder="selling sourdough from home" className={fieldClass} />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Angle (optional)</span>
          <input name="angle" maxLength={1000} placeholder="For first-time sellers in Victoria" className={fieldClass} />
        </label>
        <select name="section" defaultValue="GUIDE" className={fieldClass} aria-label="Section">
          <option value="GUIDE">Guide</option>
          <option value="NEWS">News</option>
        </select>
        <button type="submit" className={dashCtaClass}>Write draft</button>
      </div>
    </form>
  );
}
