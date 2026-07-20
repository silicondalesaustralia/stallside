/** Currency-gated local transfer (PayID / Pix / UPI). Display + confirm only — no rails. */

export type LocalTransferMethod = {
  id: string;
  currencies: string[];
  buttonLabel: string;
  /** Owner settings field label */
  aliasLabel: string;
  /** Label shown to shoppers above the stand’s alias at checkout */
  checkoutAliasLabel: string;
  aliasHint: string;
  aliasPlaceholder: string;
  validate: (value: string) => boolean;
  enabled: boolean;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** PayID format check only: AU mobile, email, ABN, or organisation ID. */
export function isPhoneEmailOrAbn(value: string): boolean {
  const v = value.trim();
  if (v.length < 3 || v.length > 120) return false;
  if (v.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  const digits = digitsOnly(v);
  if (digits.length === 11) return true; // ABN
  // AU mobile: 04xxxxxxxx, 4xxxxxxxx, +614xxxxxxxx
  if (digits.length === 9 && digits.startsWith("4")) return true;
  if (digits.length === 10 && digits.startsWith("04")) return true;
  if (digits.length === 11 && digits.startsWith("614")) return true;
  // Organisation PayID / other alias strings
  return /^[a-zA-Z0-9][a-zA-Z0-9 ._'&\-]{1,119}$/.test(v);
}

export function isPixKey(value: string): boolean {
  const v = value.trim();
  return v.length >= 3 && v.length <= 120;
}

export function isUpiId(value: string): boolean {
  const v = value.trim();
  return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(v);
}

export const LOCAL_TRANSFER_METHODS: LocalTransferMethod[] = [
  {
    id: "payid",
    currencies: ["AUD"],
    buttonLabel: "Pay with PayID",
    aliasLabel: "Your PayID",
    checkoutAliasLabel: "Stall PayID",
    aliasHint: "The phone, email, or ABN linked to your bank account.",
    aliasPlaceholder: "0400 000 000 or you@email.com",
    validate: isPhoneEmailOrAbn,
    enabled: true,
  },
  {
    id: "pix",
    currencies: ["BRL"],
    buttonLabel: "Pagar com Pix",
    aliasLabel: "Sua chave Pix",
    checkoutAliasLabel: "Stall Pix key",
    aliasHint: "Telefone, e-mail, CPF/CNPJ ou chave aleatória.",
    aliasPlaceholder: "email@exemplo.com",
    validate: isPixKey,
    enabled: false,
  },
  {
    id: "upi",
    currencies: ["INR"],
    buttonLabel: "Pay with UPI",
    aliasLabel: "Your UPI ID",
    checkoutAliasLabel: "Stall UPI ID",
    aliasHint: "Your UPI ID, e.g. name@bank.",
    aliasPlaceholder: "name@bank",
    validate: isUpiId,
    enabled: false,
  },
];

export function localTransferForCurrency(
  currency: string,
): LocalTransferMethod | null {
  const code = currency.trim().toUpperCase();
  return (
    LOCAL_TRANSFER_METHODS.find(
      (method) => method.enabled && method.currencies.includes(code),
    ) ?? null
  );
}

export function localTransferMethodById(
  id: string | null | undefined,
): LocalTransferMethod | null {
  if (!id) return null;
  return LOCAL_TRANSFER_METHODS.find((method) => method.id === id) ?? null;
}
