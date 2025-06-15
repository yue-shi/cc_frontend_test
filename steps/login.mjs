import { baseUrl, credentials, screenshotDir } from '../config.mjs';
import delay from '../utils/waitUtils.mjs';

export default async function login(page, screenshotSequence) {
  await page.goto(baseUrl);

  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', credentials.username, { delay: 100 });

  await page.waitForSelector('input[name="password"]', { visible: true });
  await page.type('input[name="password"]', credentials.password, { delay: 100 });

  delay(1000);
  await page.screenshot({ path: `${screenshotDir}/` + screenshotSequence + `_login.png` });
  delay(1000);

  await Promise.all([
    page.click('#\\31-submit'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
}
