import {
  addGalleryStand,
} from "@/app/admin/gallery/actions";

export default function AdminGalleryAddForm() {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="text-lg font-semibold">Add stand</h2>
      <form
        action={addGalleryStand}
        className="grid gap-3 text-sm"
        encType="multipart/form-data"
      >
        <input
          name="displayName"
          required
          placeholder="Stand name"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <input
          name="location"
          required
          placeholder="Location"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <input
          name="caption"
          placeholder="Caption (optional)"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <input
          name="imagePath"
          placeholder="Or public path e.g. /about/photo.jpg"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" />
        <input
          name="sortOrder"
          type="number"
          defaultValue={100}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 font-semibold text-white"
        >
          Add &amp; publish
        </button>
      </form>
    </section>
  );
}
