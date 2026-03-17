export function formatCurrency(priceCents) {
  const USD_TO_INR = 92;
  return Math.round((priceCents / 100) * USD_TO_INR);
}