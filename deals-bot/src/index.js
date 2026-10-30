import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPost, parseDealCaption } from './format.js';
import { PostedStore } from './store.js';
import { resolveDealLink } from './stores.js';
import { Telegram } from './telegram.js';

const HELP = `أرسل <b>صورة المنتج</b> ومعها وصف بهذا الترتيب (كل معلومة في سطر):

1️⃣ رابط المنتج
   • أمازون: أي رابط للمنتج، والبوت يضيف كود العمولة
   • نون، تيمو وغيرها: رابط العمولة من لوحة المتجر
2️⃣ اسم المنتج
3️⃣ السعر قبل الخصم
4️⃣ السعر بعد الخصم
5️⃣ ملاحظة (اختياري، مثل كود خصم أو مدة العرض)

مثال:
<code>https://www.amazon.sa/dp/B0BXYZ1234
سماعة سوني WH-1000XM5 لاسلكية
1499
999
العرض لمدة محدودة</code>

بجهّز لك المنشور، وأعرضه عليك قبل النشر.`;

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const config = {
  token: requireEnv('TELEGRAM_BOT_TOKEN'),
  channelId: requireEnv('TELEGRAM_CHANNEL_ID'),
  adminIds: new Set(requireEnv('ADMIN_USER_IDS').split(',').map((id) => id.trim())),
  tag: process.env.AMAZON_TAG?.trim() ?? '',
  domain: process.env.AMAZON_DOMAIN?.trim() || 'www.amazon.sa',
  disclosure: process.env.DISCLOSURE?.trim() ?? '',
};

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const store = new PostedStore(path.join(rootDir, 'data', 'posted.json'));
const tg = new Telegram(config.token);
const pending = new Map();

async function handleDeal(msg) {
  const chatId = msg.chat.id;
  const parsed = parseDealCaption(msg.caption);
  if (parsed.error) {
    await tg.sendMessage(chatId, `⚠️ ${parsed.error}\n\n${HELP}`);
    return;
  }

  const deal = await resolveDealLink(parsed.link, config);
  if (deal.error) {
    await tg.sendMessage(chatId, `⚠️ ${deal.error}`);
    return;
  }

  const caption = buildPost({
    ...parsed,
    url: deal.url,
    storeName: deal.store.name,
    disclosure: config.disclosure,
  });
  const photo = msg.photo.at(-1).file_id;
  const key = randomUUID().slice(0, 8);
  pending.set(key, { dealKey: deal.key, photo, caption, price: parsed.newPrice });

  const previous = store.lastPosted(deal.key);
  const warning = previous
    ? `\n\n⚠️ <i>هذا المنتج انتشر قبل بسعر ${previous.price} ر.س (${previous.at.slice(0, 10)})</i>`
    : '';

  await tg.sendPhoto(chatId, photo, caption + warning, {
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ انشر في القناة', callback_data: `publish:${key}` },
        { text: '❌ إلغاء', callback_data: `cancel:${key}` },
      ]],
    },
  });
}

async function handleCallback(query) {
  if (!config.adminIds.has(String(query.from.id))) {
    await tg.answerCallback(query.id, 'غير مصرّح');
    return;
  }
  const [action, key] = (query.data || '').split(':');
  const deal = pending.get(key);
  const { chat, message_id } = query.message;

  if (!deal) {
    await tg.answerCallback(query.id, 'انتهت صلاحية هذا المنشور، أرسله من جديد.');
    return;
  }
  pending.delete(key);
  await tg.editReplyMarkup(chat.id, message_id, { inline_keyboard: [] });

  if (action === 'cancel') {
    await tg.answerCallback(query.id, 'تم الإلغاء');
    return;
  }

  try {
    await tg.sendPhoto(config.channelId, deal.photo, deal.caption);
    await store.markPosted(deal.dealKey, deal.price);
    await tg.answerCallback(query.id, 'تم النشر ✅');
  } catch (err) {
    console.error('Publish failed:', err.message);
    await tg.answerCallback(query.id, 'فشل النشر');
    await tg.sendMessage(chat.id, `⚠️ فشل النشر في القناة:\n<code>${err.message}</code>\n\nتأكد إن البوت مشرف في القناة وله صلاحية النشر.`);
  }
}

async function handleMessage(msg) {
  if (msg.chat.type !== 'private') return;
  const userId = String(msg.from.id);
  const isAdmin = config.adminIds.has(userId);

  if (!isAdmin) {
    await tg.sendMessage(msg.chat.id, `هذا البوت خاص.\nرقم حسابك: <code>${userId}</code>`);
    return;
  }
  if (msg.photo) {
    await handleDeal(msg);
    return;
  }
  await tg.sendMessage(msg.chat.id, `أهلاً 👋 رقم حسابك: <code>${userId}</code>\n\n${HELP}`);
}

async function main() {
  await store.load();
  const me = await tg.call('getMe');
  console.log(`Bot @${me.username} running. Posting to ${config.channelId}`);

  let offset = 0;
  for (;;) {
    try {
      const updates = await tg.getUpdates(offset);
      for (const update of updates) {
        offset = update.update_id + 1;
        try {
          if (update.message) await handleMessage(update.message);
          else if (update.callback_query) await handleCallback(update.callback_query);
        } catch (err) {
          console.error('Update handling failed:', err);
        }
      }
    } catch (err) {
      console.error('Polling error:', err.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

main();
