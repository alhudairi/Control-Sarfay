import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPost, discountPercent, parseDealCaption, parsePrice } from '../src/format.js';
import { affiliateLink, detectStore, extractAsin, isAmazonShortLink, resolveDealLink } from '../src/stores.js';

const amazonConfig = { domain: 'www.amazon.sa', tag: 'mytag-21' };

test('extractAsin handles common Amazon URL shapes', () => {
  assert.equal(extractAsin('https://www.amazon.sa/dp/B0BXYZ1234'), 'B0BXYZ1234');
  assert.equal(extractAsin('https://www.amazon.sa/-/ar/Sony-Headphones/dp/B0BXYZ1234/ref=sr_1_1?th=1'), 'B0BXYZ1234');
  assert.equal(extractAsin('https://www.amazon.sa/gp/product/B0BXYZ1234?psc=1'), 'B0BXYZ1234');
  assert.equal(extractAsin('b0bxyz1234'), 'B0BXYZ1234');
  assert.equal(extractAsin('https://www.amazon.sa/s?k=headphones'), null);
});

test('isAmazonShortLink detects amzn.to and a.co', () => {
  assert.ok(isAmazonShortLink('https://amzn.to/3abcDEF'));
  assert.ok(isAmazonShortLink('https://a.co/d/abc'));
  assert.ok(!isAmazonShortLink('https://www.amazon.sa/dp/B0BXYZ1234'));
  assert.ok(!isAmazonShortLink('not a url'));
});

test('detectStore recognises stores by domain', () => {
  assert.equal(detectStore('https://www.amazon.sa/dp/B0BXYZ1234').id, 'amazon');
  assert.equal(detectStore('https://www.noon.com/saudi-ar/item/N123/p/').id, 'noon');
  assert.equal(detectStore('https://share.temu.com/abc').id, 'temu');
  assert.equal(detectStore('https://ar.shein.com/item.html').id, 'shein');
  assert.equal(detectStore('https://example-shop.com/p/1').id, 'other');
  assert.equal(detectStore('https://notamazon.sa/x').id, 'other');
  assert.equal(detectStore('not a url'), null);
});

test('affiliateLink builds a clean tagged URL', () => {
  assert.equal(affiliateLink('B0BXYZ1234', amazonConfig), 'https://www.amazon.sa/dp/B0BXYZ1234?tag=mytag-21');
});

test('resolveDealLink rewrites Amazon links and keeps other stores untouched', async () => {
  const amazon = await resolveDealLink('https://www.amazon.sa/-/ar/x/dp/B0BXYZ1234/ref=abc?tag=someone-21', amazonConfig);
  assert.equal(amazon.url, 'https://www.amazon.sa/dp/B0BXYZ1234?tag=mytag-21');
  assert.equal(amazon.key, 'amazon:B0BXYZ1234');

  const asinOnly = await resolveDealLink('B0BXYZ1234', amazonConfig);
  assert.equal(asinOnly.store.id, 'amazon');

  const noonLink = 'https://www.noon.com/saudi-ar/item/N123/p/?o=abc&utm_source=affiliate';
  const noon = await resolveDealLink(noonLink, amazonConfig);
  assert.equal(noon.url, noonLink);
  assert.equal(noon.store.name, 'نون');
  assert.equal(noon.key, 'noon:www.noon.com/saudi-ar/item/N123/p/');

  assert.ok((await resolveDealLink('https://www.amazon.sa/dp/B0BXYZ1234', { domain: 'www.amazon.sa', tag: '' })).error);
  assert.ok((await resolveDealLink('not a url', amazonConfig)).error);
  assert.ok((await resolveDealLink('https://www.amazon.sa/s?k=x', amazonConfig)).error);
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

test('buildPost includes store, discount, prices, link and escapes HTML', () => {
  assert.equal(discountPercent(1499, 999), 33);
  const post = buildPost({
    title: 'Cable <USB-C>',
    oldPrice: 100,
    newPrice: 75,
    note: '',
    url: 'https://www.noon.com/p/?a=1&b=2',
    storeName: 'نون',
    disclosure: 'قد أحصل على عمولة',
  });
  assert.match(post, /خصم 25%/);
  assert.match(post, /المتجر: نون/);
  assert.match(post, /Cable &lt;USB-C&gt;/);
  assert.match(post, /<s>100 ر.س<\/s>/);
  assert.match(post, /href="https:\/\/www.noon.com\/p\/\?a=1&amp;b=2">اطلبه من نون</);
  assert.match(post, /قد أحصل على عمولة/);

  assert.match(buildPost({ title: 't', oldPrice: 2, newPrice: 1, url: 'https://x.com', storeName: null }), />اطلبه الآن</);
});
