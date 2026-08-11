const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  for (const p of ['in-track-person', 'in-quality-stats', 'in-score', 'in-track-device']) {
    await page.goto('http://127.0.0.1:8090/web/wb/' + p + '.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));
    console.log(p, '->', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.disease-quick-link'))
        .map(a => a.textContent.trim() + (a.classList.contains('is-active') ? '*' : ''))
        .join(', ')
    ));
  }
  await browser.close();
})();
