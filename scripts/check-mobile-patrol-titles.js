const puppeteer = require('puppeteer-core');

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896'] });
  const p = await b.newPage();
  await p.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await p.goto('http://127.0.0.1:8090/app/mine/pages/notify.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForSelector('#wb-mobile-list', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  const info = await p.evaluate(() => {
    const raw = window.localStorage.getItem('whmetro-notify-extra');
    const stored = raw ? JSON.parse(raw) : [];
    const cards = Array.from(document.querySelectorAll('#wb-mobile-list > *')).map(c => ({
      title: c.querySelector('h3, .mp-wb-card__title')?.textContent?.trim()
    }));
    return { stored: stored.filter(r => r.type === '项目巡查'), cards };
  });
  console.log('stored patrol rows:', JSON.stringify(info.stored.map(r => ({
    id: r.id,
    title: r.title,
    source: r.source,
    projectName: r.projectName,
    section: r.section,
    firstProjectName: (r.projects || [])[0]?.projectName,
    firstSection: (r.projects || [])[0]?.section
  })), null, 2));
  console.log('card titles:', info.cards.map(c => c.title));
  await b.close();
})();
