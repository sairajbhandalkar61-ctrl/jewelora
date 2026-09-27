/**
 * Benchmark bullion metal rates in INR per gram (can be customized)
 */
export const DEFAULT_RATES = {
  "24K": 7500,
  "22K": 6875,
  "18K": 5625,
  "14K": 4380,
  "Silver": 92,
  "Platinum": 3800
};

/**
 * Calculate dynamic live jewellery price breakdown
 * Gold Base Value = Weight * Rate
 * Subtotal = Gold Base + Making Charges + Stone Charges
 * GST = Subtotal * 3% (1.5% CGST + 1.5% SGST)
 * Final Price = Subtotal + GST
 */
export function calculatePriceBreakdown({
  weight = 0,
  purity = "22K",
  customRate = null,
  makingCharges = 0,
  stoneCharges = 0
}) {
  const wt = Number(weight) || 0;
  const ratePerGram = customRate !== null && customRate !== "" 
    ? Number(customRate) 
    : (DEFAULT_RATES[purity] || DEFAULT_RATES["22K"]);

  const baseGoldValue = Math.round(wt * ratePerGram);
  const making = Math.round(Number(makingCharges) || 0);
  const stone = Math.round(Number(stoneCharges) || 0);

  const subtotal = baseGoldValue + making + stone;
  const gst = Math.round(subtotal * 0.03); // 3% jewellery GST
  const cgst = Math.round(gst / 2);
  const sgst = gst - cgst;
  const finalPrice = subtotal + gst;

  return {
    ratePerGram,
    baseGoldValue,
    makingCharges: making,
    stoneCharges: stone,
    subtotal,
    gst,
    cgst,
    sgst,
    finalPrice
  };
}

/**
 * Calculate gross profit margin %
 */
export function calculateMargin(sellingPrice, purchasePrice) {
  const sell = Number(sellingPrice) || 0;
  const buy = Number(purchasePrice) || 0;
  if (!sell || sell <= 0) return 0;
  const margin = ((sell - buy) / sell) * 100;
  return margin.toFixed(1);
}
