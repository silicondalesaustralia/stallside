import type { RecipeRow } from "@/lib/production/load-cost-context";
import { hintClass, inputClass, labelClass } from "../../form-styles";

export default function RecipeSettingsFields({ recipe }: { recipe: RecipeRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="id" value={recipe.id} />
      <label className={labelClass}>
        Name
        <input name="name" required defaultValue={recipe.name} className={inputClass} />
      </label>
      <label className={labelClass}>
        One batch makes
        <input name="yieldQuantity" type="number" step="any" min="0" required defaultValue={recipe.yieldQuantity} className={inputClass} />
      </label>
      <label className={labelClass}>
        Unit name
        <input name="yieldLabel" defaultValue={recipe.yieldLabel} className={inputClass} />
      </label>
      <label className={labelClass}>
        Waste / failure %
        <input name="wastePercent" type="number" step="any" min="0" defaultValue={recipe.wastePercent} className={inputClass} />
        <span className={hintClass}>Extra material lost to spills, offcuts or failed prints.</span>
      </label>
      <label className={labelClass}>
        Labour minutes per batch
        <input name="labourMinutes" type="number" step="1" min="0" defaultValue={recipe.labourMinutes} className={inputClass} />
        <span className={hintClass}>Hands-on time only.</span>
      </label>
      <label className={labelClass}>
        Labour rate ($ / hour)
        <input name="labourRate" type="number" step="0.01" min="0" defaultValue={(recipe.labourRateCents / 100).toFixed(2)} className={inputClass} />
        <span className={hintClass}>Pay yourself. $0 hides what your time is worth.</span>
      </label>
      <label className={labelClass}>
        Overhead per batch ($)
        <input name="overhead" type="number" step="0.01" min="0" defaultValue={(recipe.overheadCents / 100).toFixed(2)} className={inputClass} />
        <span className={hintClass}>Oven or printer time, power, equipment wear.</span>
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Method / notes
        <textarea name="instructions" rows={3} defaultValue={recipe.instructions ?? ""} className={inputClass} />
      </label>
    </div>
  );
}
