import { addStorefrontRedirect } from "./actions";

const inputClass = "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

export default function RedirectAddForm() {
  return (
    <section className="dash-card p-4">
      <h2 className="text-sm font-semibold text-[var(--field)]">Add redirect</h2>
      <form
        action={addStorefrontRedirect}
        className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
      >
        <label className="block text-sm">
          <span className="font-medium">From path</span>
          <input name="fromPath" required placeholder="/products/old-slug" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">To path or URL</span>
          <input name="toPath" required placeholder="/products/new-slug" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Type</span>
          <select name="code" defaultValue="301" className={inputClass}>
            <option value="301">Permanent (301)</option>
            <option value="302">Temporary (302)</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Add redirect
        </button>
      </form>
    </section>
  );
}
