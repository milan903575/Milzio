// If stored as INR paise (e.g. 20000 = ₹200)
export function formatCurrency(priceCents) {
  const inrAmount = Math.round(Number(priceCents) / 100);
  return '₹' + inrAmount.toLocaleString('en-IN');
}
