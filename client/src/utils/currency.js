/**
 * Format a number to Indian Rupee currency string: ? 1,23,456
 */
export function formatINR(amount, includeSymbol = true) {
  const num = Number(amount) || 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(num);
  return includeSymbol ? `? ${formatted}` : formatted;
}

/**
 * Format large amounts compactly: ? 12.5L or ? 1.2Cr
 */
export function formatCompactINR(amount) {
  const num = Number(amount) || 0;
  if (num >= 10000000) {
    return `? ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `? ${(num / 100000).toFixed(1)} L`;
  }
  if (num >= 1000) {
    return `? ${(num / 1000).toFixed(1)} K`;
  }
  return `? ${num.toLocaleString("en-IN")}`;
}

/**
 * Convert number to words in Indian numbering system for tax invoices
 */
export function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n) {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (hundred > 0) str += a[hundred] + " Hundred";
    if (rest > 0) str += (str ? " and " : "") + convertTwoDigits(rest);
    return str;
  }

  let crore = Math.floor(num / 10000000);
  let lakh = Math.floor((num % 10000000) / 100000);
  let thousand = Math.floor((num % 100000) / 1000);
  let remaining = num % 1000;

  let words = "";
  if (crore > 0) words += convertThreeDigits(crore) + " Crore ";
  if (lakh > 0) words += convertThreeDigits(lakh) + " Lakh ";
  if (thousand > 0) words += convertThreeDigits(thousand) + " Thousand ";
  if (remaining > 0) words += convertThreeDigits(remaining);

  return "Rupees " + words.trim() + " Only";
}
