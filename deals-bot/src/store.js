import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Remembers which products were already posted so the channel doesn't get duplicates.
// Keys look like "amazon:B0BXYZ1234" or "noon:www.noon.com/saudi-ar/...".
export class PostedStore {
  constructor(file) {
    this.file = file;
    this.posted = {};
  }

  async load() {
    try {
      this.posted = JSON.parse(await readFile(this.file, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  lastPosted(key) {
    return this.posted[key] ?? null;
  }

  async markPosted(key, price) {
    this.posted[key] = { price, at: new Date().toISOString() };
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(this.posted, null, 2));
  }
}
