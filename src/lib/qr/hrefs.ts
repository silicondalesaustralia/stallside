/** Dashboard editor for a business's main QR poster (the one that prints the /s/ link). */
export function businessQrHref(standId: string): string {
  return `/dashboard/qr/business/${standId}`;
}
