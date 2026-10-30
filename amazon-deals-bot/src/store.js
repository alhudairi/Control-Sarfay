import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Remembers which ASINs were already posted so the channel doesn't get duplicates.
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

  lastPosted(asin) {
    return this.posted[asin] ?? null;
  }

  async markPosted(asin, price) {
    this.posted[asin] = { price, at: new Date().toISOString() };
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(this.posted, null, 2));
  }
}
