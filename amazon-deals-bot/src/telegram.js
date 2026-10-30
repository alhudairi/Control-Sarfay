export class Telegram {
  constructor(token) {
    this.base = `https://api.telegram.org/bot${token}`;
  }

  async call(method, params = {}) {
    const res = await fetch(`${this.base}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description}`);
    return data.result;
  }

  getUpdates(offset) {
    return this.call('getUpdates', {
      offset,
      timeout: 50,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  sendMessage(chatId, text, extra = {}) {
    return this.call('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
  }

  sendPhoto(chatId, photo, caption, extra = {}) {
    return this.call('sendPhoto', { chat_id: chatId, photo, caption, parse_mode: 'HTML', ...extra });
  }

  answerCallback(id, text) {
    return this.call('answerCallbackQuery', { callback_query_id: id, text });
  }

  editReplyMarkup(chatId, messageId, replyMarkup) {
    return this.call('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup,
    });
  }
}
