import assert from 'node:assert/strict';
import { test } from 'node:test';
import { affiliateLink, extractAsin, isShortLink } from '../src/amazon.js';
import { buildPost, discountPercent, parseDealCaption, parsePrice } from '../src/format.js';

test('extractAsin handles common Amazon URL shapes', () => {
  assert.equal(extractAsin('https://www.amazon.sa/dp/B0BXYZ1234'), 'B0BXYZ1234');
  assert.equal(extractAsin('https://www.amazon.sa/-/ar/Sony-Headphones/dp/B0BXYZ1234/ref=sr_1_1?th=1'), 'B0BXYZ1234');
  assert.equal(extractAsin('https://www.amazon.sa/gp/product/B0BXYZ1234?psc=1'), 'B0BXYZ1234');
  assert.equal(extractAsin('b0bxyz1234'), 'B0BXYZ1234');
  assert.equal(extractAsin('https://www.amazon.sa/s?k=headphones'), null);
});

test('isShortLink detects amzn.to and a.co', () => {
  assert.ok(isShortLink('https://amzn.to/3abcDEF'));
  assert.ok(isShortLink('https://a.co/d/abc'));
  assert.ok(!isShortLink('https://www.amazon.sa/dp/B0BXYZ1234'));
  assert.ok(!isShortLink('not a url'));
});

test('affiliateLink builds a clean tagged URL', () => {
  assert.equal(
    affiliateLink('B0BXYZ1234', { domain: 'www.amazon.sa', tag: 'mytag-21' }),
    'https://www.amazon.sa/dp/B0BXYZ1234?tag=mytag-21',
  );
});

test('parsePrice accepts Arabic digits and separators', () => {
  assert.equal(parsePrice('١٬٤٩٩'), 1499);
  assert.equal(parsePrice('1,499.50 ر.س'), 1499.5);
  assert.equal(parsePrice('٩٩٫٥'), 99.5);
  assert.equal(parsePrice('abc'), null);
});

test('parseDealCaption validates input', () => {
  const ok = parseDealCaption('https://www.amazon.sa/dp/B0BXYZ1234\nسماعة\n1499\n999\nكود: SAVE10');
  assert.equal(ok.title, 'سماعة');
  assert.equal(ok.oldPrice, 1499);
  assert.equal(ok.newPrice, 999);
  assert.equal(ok.note, 'كود: SAVE10');
  assert.ok(parseDealCaption('only\ntwo').error);
  assert.ok(parseDealCaption('link\ntitle\n100\n200').error);
});

test('buildPost includes discount, prices, link and escapes HTML', () => {
  assert.equal(discountPercent(1499, 999), 33);
  const post = buildPost({
    title: 'Cable <USB-C>',
    oldPrice: 100,
    newPrice: 75,
    note: '',
    url: 'https://www.amazon.sa/dp/B0BXYZ1234?tag=mytag-21',
    disclosure: 'قد أحصل على عمولة',
  });
  assert.match(post, /خصم 25%/);
  assert.match(post, /Cable &lt;USB-C&gt;/);
  assert.match(post, /<s>100 ر.س<\/s>/);
  assert.match(post, /tag=mytag-21/);
  assert.match(post, /قد أحصل على عمولة/);
});
