const puppeteer = require('puppeteer-core');

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896'] });
  const p = await b.newPage();
  await p.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await p.goto('http://127.0.0.1:8090/app/mine/pages/notify.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForSelector('#wb-mobile-list', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  const info = await p.evaluate(() => {
    const cards = document.querySelectorAll('#wb-mobile-list > *');
    return {
      count: cards.length,
      titles: Array.from(cards).map(c => c.querySelector('h3, .mp-wb-card__title')?.textContent?.trim() || c.textContent?.slice(0, 30))
    };
  });
  console.log(info);
  await b.close();
})();
