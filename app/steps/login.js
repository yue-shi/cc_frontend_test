import { baseUrl, credentials, screenshotDir } from '../config.js';
import delay from '../utils/waitUtils.js';

export default async function login(page, screenshotSequence) {
  await page.goto(baseUrl);

  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', credentials.username, { delay: 100 });

  await page.waitForSelector('input[name="password"]', { visible: true });
  await page.type('input[name="password"]', credentials.password, { delay: 100 });

  delay(1000);

  await page.screenshot({ path: `${screenshotDir}/` + screenshotSequence + `_login.png` });

  delay(1000);

  const clickLogin = Date.now();

  await Promise.all([
    page.click('#\\31-submit'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  await Promise.all([
    waitForButtonWithText(page, 'HQ'),
    waitForButtonWithText(page, 'Location Status'),
    waitForButtonWithText(page, 'Creative Center')
  ]);

  console.log(`login took: ${Date.now() - clickLogin}ms`);
}

async function waitForButtonWithText(page, text) {
  await page.waitForFunction(
    (text) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.innerText.includes(text));
    },
    {},
    text
  );
}