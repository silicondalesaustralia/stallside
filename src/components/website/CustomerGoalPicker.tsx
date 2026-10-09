import type { CustomerGoal, CustomerGoalOption } from "@/lib/website/templates/recommend";

/** Plain GET form: works without JavaScript and keeps the choice in the URL. */
export default function CustomerGoalPicker({
  goals,
  selected,
}: {
  goals: CustomerGoalOption[];
  selected: CustomerGoal | null;
}) {
  return (
    <form method="get" className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4">
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--field)]">
          What do customers mostly do on your website?
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {goals.map((goal) => (
            <label key={goal.id} className="flex items-start gap-2 text-sm">
              <input type="radio" name="goal" value={goal.id} defaultChecked={selected === goal.id} className="mt-1" />
              <span>
                {goal.label}
                {goal.hint ? <span className="block text-xs text-[var(--muted)]">{goal.hint}</span> : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="mt-3 rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
        Show recommended layouts
      </button>
    </form>
  );
}
