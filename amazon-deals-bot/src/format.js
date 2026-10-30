const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function parsePrice(text) {
  if (!text) return null;
  const normalized = text
    .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d))
    .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
    .replace(/٫/g, '.')
    .replace(/[,٬\s]/g, '')
    .replace(/[^\d.]/g, '');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// Caption format sent by the admin with the product photo:
//   line 1: Amazon link (or ASIN)
//   line 2: product title
//   line 3: price before discount
//   line 4: price after discount
//   line 5+: optional note (coupon code, deal end time, ...)
export function parseDealCaption(caption) {
  const lines = (caption || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 4) {
    return { error: 'الوصف ناقص. لازم ٤ أسطر على الأقل: الرابط، الاسم، السعر قبل، السعر بعد.' };
  }
  const [link, title, oldRaw, newRaw, ...rest] = lines;
  const oldPrice = parsePrice(oldRaw);
  const newPrice = parsePrice(newRaw);
  if (!oldPrice || !newPrice) {
    return { error: 'ما قدرت أقرأ الأسعار. اكتب السعر رقم فقط في السطر ٣ و ٤.' };
  }
  if (newPrice >= oldPrice) {
    return { error: 'السعر بعد الخصم لازم يكون أقل من السعر قبل الخصم.' };
  }
  return { link, title, oldPrice, newPrice, note: rest.join('\n') };
}

export function discountPercent(oldPrice, newPrice) {
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

function formatAmount(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildPost({ title, oldPrice, newPrice, note, url, disclosure }) {
  const percent = discountPercent(oldPrice, newPrice);
  const saved = oldPrice - newPrice;
  const lines = [
    `🔥 <b>خصم ${percent}%</b>`,
    '',
    `🛍️ ${escapeHtml(title)}`,
    '',
    `❌ قبل: <s>${formatAmount(oldPrice)} ر.س</s>`,
    `✅ الآن: <b>${formatAmount(newPrice)} ر.س</b>`,
    `💰 توفّر: ${formatAmount(saved)} ر.س`,
  ];
  if (note) lines.push('', `📌 ${escapeHtml(note)}`);
  lines.push('', `🛒 <a href="${url}">اطلبه من أمازون</a>`);
  if (disclosure) lines.push('', `<i>${escapeHtml(disclosure)}</i>`);
  return lines.join('\n');
}
