export function formatCurrency(priceCents) {
  const inrAmount = Math.round(Number(priceCents) / 100);
  return '₹' + inrAmount.toLocaleString('en-IN');
}
