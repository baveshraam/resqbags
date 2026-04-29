export function calculateCustomerPrice(merchantPrice: number): number {
  if (!Number.isFinite(merchantPrice) || merchantPrice <= 0) return 0;
  const raw = merchantPrice * 1.10;
  const roundedToNearestTen = Math.round(raw / 10) * 10;
  return Math.max(0, roundedToNearestTen - 1);
}
