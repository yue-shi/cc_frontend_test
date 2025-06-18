import { screenshotDir } from '../config.js';

export default async function assembly(page, screenshotSequence) {
    await Promise.all([
      page.evaluate(() => {
        const buttons = [...document.querySelectorAll('button')];
        const ccBtn = buttons.find(btn => btn.innerText.trim() === 'Creative Center');
        if (ccBtn) {
          ccBtn.click();
        }
      })
    ]);

    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    /*
    const assembly_layouts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim());
    });
    console.log('p tags: ', assembly_layouts);
    */

    await page.waitForFunction(() => {
      const regex = /^\d+\s+(horizontal|vertical)\s+screens$/i;
      return [...document.querySelectorAll('p')].some(p => p.innerText.trim().toLowerCase().match(regex));
    }, { timeout: 10000 });

    await page.screenshot({ path: `${screenshotDir}/` + screenshotSequence + '_assembly_first_load.png' });
}