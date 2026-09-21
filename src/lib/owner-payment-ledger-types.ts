export type LedgerRow = {
  id: string;
  at: string;
  kind: "Transaction fee" | "Subscription";
  reference: string;
  detail: string;
  amount: string;
  search: string;
};
