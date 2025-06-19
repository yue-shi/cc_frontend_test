import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};