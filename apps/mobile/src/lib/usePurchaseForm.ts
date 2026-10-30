import { useState } from "react";
import {
  compatibleMaterialUnits,
  type MaterialUnit,
} from "@contracts/mobile/material-units";
import type { MobileMaterial, PurchaseBody } from "@contracts/mobile/materials";
import { inputToCents } from "@/lib/money-input";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Bulk units suit purchases (kg, L); count stays "each". */
function defaultUnit(baseUnit: MaterialUnit): MaterialUnit {
  if (baseUnit === "G" || baseUnit === "MG") return "KG";
  if (baseUnit === "ML") return "L";
  return baseUnit;
}

/** Form state for "Record incoming supplies". */
export function usePurchaseForm(
  materials: MobileMaterial[],
  today: string,
  initialId?: string,
) {
  const [ingredientId, setIngredientIdState] = useState(initialId ?? "");
  const material = materials.find((m) => m.id === ingredientId);
  const [unit, setUnit] = useState<MaterialUnit>(
    material ? defaultUnit(material.baseUnit) : "KG",
  );
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState("");
  const [supplier, setSupplier] = useState("");
  const [receivedOn, setReceivedOn] = useState(today);
  const [lotCode, setLotCode] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [notes, setNotes] = useState("");
  const units = material ? compatibleMaterialUnits(material.baseUnit) : [];

  function setIngredientId(id: string) {
    setIngredientIdState(id);
    const next = materials.find((m) => m.id === id);
    if (next) setUnit(defaultUnit(next.baseUnit));
  }

  function problem(): string | null {
    if (!material) return "Choose a material.";
    if (!(Number(quantity) > 0)) return "Enter the quantity received.";
    if (!units.includes(unit)) return "Pick a unit that matches the material.";
    if (inputToCents(total) == null) return "Enter the total paid.";
    if (receivedOn && !DAY.test(receivedOn))
      return "Received must be YYYY-MM-DD.";
    if (expiresOn && !DAY.test(expiresOn)) return "Expiry must be YYYY-MM-DD.";
    return null;
  }

  function body(): PurchaseBody {
    return {
      ingredientId,
      quantity: Number(quantity),
      unit,
      totalCents: inputToCents(total) ?? 0,
      supplier: supplier.trim() || null,
      lotCode: lotCode.trim() || null,
      expiresOn: expiresOn.trim() || null,
      notes: notes.trim() || null,
      receivedOn: receivedOn.trim() || null,
    };
  }

  return {
    material,
    units,
    values: {
      ingredientId,
      unit,
      quantity,
      total,
      supplier,
      receivedOn,
      lotCode,
      expiresOn,
      notes,
    },
    set: {
      ingredientId: setIngredientId,
      unit: setUnit,
      quantity: setQuantity,
      total: setTotal,
      supplier: setSupplier,
      receivedOn: setReceivedOn,
      lotCode: setLotCode,
      expiresOn: setExpiresOn,
      notes: setNotes,
    },
    problem,
    body,
  };
}

export type PurchaseForm = ReturnType<typeof usePurchaseForm>;
