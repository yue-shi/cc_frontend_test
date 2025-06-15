import puppeteer from 'puppeteer';
import { screenshotDir, traceDir } from './config.mjs';
import login from './steps/login.mjs';

(async () => {
  let screenshotSequence = 0;

  const browser = await puppeteer.launch({
    headless: false,  // Use true for CI
    userDataDir: './user-data-dir',
    args: [
      '--disable-features=TrackingProtection3pcd',
      '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
      '--disable-site-isolation-trials',
      '--disable-blink-features=BlockCredentialedSubresources',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--disable-features=site-per-process'
    ]
  });

  const page = await browser.newPage();

  const client = await page.createCDPSession();
  await client.send('Network.clearBrowserCookies');

  await page.setViewport({
    width: 1920,
    height: 1080
  });

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  );

  try {
    await login(page, ++screenshotSequence);

    await page.waitForSelector('button');
    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence +'_switch_board.png' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    /*
    const buttonTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(btn => btn.innerText.trim());
    });
    console.log('Buttons found:', buttonTexts);
    */

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

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_assembly_first_load.png' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.tracing.start({
      path: `${traceDir}/` + 'navigate_to_components.json',
      categories: ['devtools.timeline']
    });

    const componentsLinkClicked = await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Components');
      if (link) {
        link.click();
        return true;
      }
      return false;
    });

    if (!componentsLinkClicked) throw new Error("Components link not found");

    await page.waitForSelector('[data-testid="CropFreeIcon"]');

    await page.tracing.stop();
    console.log('Performance trace saved to navigate_to_components.json');

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_components_first_load.png' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.tracing.start({
      path: `${traceDir}/` + 'navigate_to_products.json',
      categories: ['devtools.timeline']
    });

    const productsLinkClicked = await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Products');
      if (link) {
        link.click();
        return true;
      }
      return false;
    });

    if (!productsLinkClicked) throw new Error("Products link not found");

    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('[data-testid="card"] img'));
      return images.some(img => !img.src.startsWith('data:image/'));
    }, { timeout: 15000 });

    await page.waitForSelector('[data-testid="card"] img');
    await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('[data-testid="card"] img'));
      return Promise.all(
        images.map(img => {
          if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    });

    await page.tracing.stop();
    console.log('Performance trace saved to navigate_to_products.json');

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_products_first_load.png' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.tracing.start({
      path: `${traceDir}/` + 'navigate_to_locations.json',
      categories: ['devtools.timeline']
    });

    const locationsLinkClicked = await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Locations');
      if (link) {
        link.click();
        return true;
      }
      return false;
    });

    if (!locationsLinkClicked) throw new Error("Locations link not found");

    await page.waitForFunction(() => {
      const table = document.querySelector('table');
      if (!table) return false;
      const rows = table.querySelectorAll('tr');
      return Array.from(rows).some(row => row.querySelectorAll('td').length > 0);
    }, { timeout: 30000 });

    await page.tracing.stop();
    console.log('Performance trace saved to navigate_to_locations.json');

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_locations_first_load.png' });

    await new Promise(resolve => setTimeout(resolve, 2000));
   
    await page.tracing.start({
      path: `${traceDir}/` + 'navigate_to_assemblies.json',
      categories: ['devtools.timeline']
    });

    const startNavigateToAssemblies = Date.now();

    const assembliesLinkClicked = await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Assemblies');
      if (link) {
        link.click();
        return true;
      }
      return false;
    });

    if (!assembliesLinkClicked) throw new Error("assemblies link not found");

    await page.waitForFunction(() => {
      const regex = /^\d+\s+(horizontal|vertical)\s+screens$/i;
      return [...document.querySelectorAll('p')].some(p => p.innerText.trim().toLowerCase().match(regex));
    }, { timeout: 10000 });

    console.log(`Navigate to Assemblies page took: ${Date.now() - startNavigateToAssemblies}ms`);

    await page.tracing.stop();
    console.log('Performance trace saved to navigate_to_assemblies.json');

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_assemblies_second_load.png' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('p')).some(p => p.textContent.trim() === 'Status');
    }, { timeout: 10000 });
    
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p'));
      const target = elements.find(p => p.textContent.trim() === 'Status');
      if (target) target.click();
    });

    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('div')).some(div =>
        div.textContent.trim() === 'Ready to use'
      );
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_assemblies_status_expanded.png' });

    const startReadToUse = Date.now();

    await page.evaluate(() => {
      const div = Array.from(document.querySelectorAll('div')).find(
        d => d.innerHTML.trim() === 'Ready to use'
      );
      if (div) div.click();
    });

    await page.waitForFunction(() => {
      const checkbox = document.querySelector('input[type="checkbox"][name="Ready to use"][value="ready"]');
      return checkbox && checkbox.checked;
    }, { timeout: 10000 }); 

    await page.waitForFunction(() => {
      const regex = /^\d+\s+(horizontal|vertical)\s+screens$/i;
      return [...document.querySelectorAll('p')].some(p => p.innerText.trim().toLowerCase().match(regex));
    }, { timeout: 10000 });

    console.log(`Select 'Read to use' took: ${Date.now() - startReadToUse}ms`);

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_assemblies_ready_to_use.png' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="Ready to use"]');
      if (checkbox && checkbox.checked) {
        checkbox.click(); // Uncheck it
      }
    });

    const startDraft = Date.now();

    await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="Draft"]');
      if (checkbox && !checkbox.checked) {
        checkbox.click(); // Check it
      }
    });

    await page.waitForFunction(() => {
      const regex = /^\d+\s+(horizontal|vertical)\s+screens$/i;
      return [...document.querySelectorAll('p')].some(p => p.innerText.trim().toLowerCase().match(regex));
    }, { timeout: 10000 });

    console.log(`Select 'Draft' tooke: ${Date.now() - startDraft}ms`);

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_assemblies_draft.png' });

    // uncheck "draft"
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="Draft"]');
      if (checkbox && checkbox.checked) {
        checkbox.click(); 
      }
    });

    // collapse status
    const accordionSelector = '[id="panel1a-header"]';
    await page.waitForSelector(accordionSelector);
    const isExpanded = await page.$eval(accordionSelector, el => el.getAttribute('aria-expanded') === 'true');
    if (isExpanded) {
      await page.click(accordionSelector);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForSelector('textarea[placeholder="Filter"]');
    const textarea = await page.$('textarea[placeholder="Filter"]');
    await textarea.type('breakfast', { delay: 100});

    const startFilter = Date.now();

    await textarea.press('Enter');

    await page.waitForFunction(() => {
      const regex = /^\d+\s+(horizontal|vertical)\s+screens$/i;
      return [...document.querySelectorAll('p')].some(p => p.innerText.trim().toLowerCase().match(regex));
    }, { timeout: 10000 });

    console.log(`Filter by 'breakfast' took: ${ Date.now() - startFilter }ms`);

    await page.screenshot({ path: `${screenshotDir}/` + ++screenshotSequence + '_assemblies_search.png' });

    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    console.error('Error during automation: ', err.message);
  } finally {
    await browser.close();
  }
})()
