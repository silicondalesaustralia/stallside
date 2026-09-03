import { createBlogPost } from "../actions";

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          New post
        </h1>
      </div>

      {params.error ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          Check the title and slug — slugs must be unique and cannot be reserved words.
        </p>
      ) : null}

      <form action={createBlogPost} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5">
        <label className="block text-sm">
          <span className="font-medium">Title</span>
          <input name="title" required className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">URL slug</span>
          <input name="slug" placeholder="e.g. sourdough-tips" className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
        </label>
        <button type="submit" className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white">
          Create post
        </button>
      </form>
    </main>
  );
}
