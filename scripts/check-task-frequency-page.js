// 走查：巡线任务频率设置（优化后）+ 快捷操作组件
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090/web/wb/';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950, deviceScaleFactor: 1 });

  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  // 1) 频率设置页：4 条规则、无立即生成、筛选项、组件渲染
  await page.goto(BASE + 'in-task-frequency.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  const ruleIds = await page.$$eval('#rules-table-body tr', trs => trs.map(tr => tr.children[0].textContent.trim()));
  const hasGen = await page.$$eval('#rules-table-body a', as => as.some(a => a.textContent.includes('立即生成')));
  const quickLinks = await page.$$eval('#project-quick-links .disease-quick-link', as => as.map(a => a.textContent.trim()));
  const quickActive = await page.$eval('#project-quick-links .disease-quick-link.is-active', a => a.textContent.trim());
  console.log('rules:', JSON.stringify(ruleIds), '| hasGenBtn:', hasGen);
  console.log('quickLinks:', JSON.stringify(quickLinks), '| active:', quickActive);
  await page.screenshot({ path: path.resolve(__dirname, '../screenshots/task-frequency-page.png') });

  // 2) 筛选：应用范围=浅埋段范围 → 剩 R-003/R-004
  await page.select('#filter-scope', 'shallow');
  await page.click('[data-action="filter-search"]');
  await new Promise(r => setTimeout(r, 300));
  const filtered = await page.$$eval('#rules-table-body tr', trs => trs.map(tr => tr.children[0].textContent.trim()));
  console.log('filtered(shallow):', JSON.stringify(filtered));
  await page.click('[data-action="filter-reset"]');
  await new Promise(r => setTimeout(r, 300));

  // 3) 停用二次确认
  await page.click('[data-action="toggle-rule"][data-id="R-001"]');
  await new Promise(r => setTimeout(r, 300));
  const confirmTitle = await page.$eval('#confirm-title', el => el.textContent);
  const confirmText = await page.$eval('#confirm-text', el => el.textContent);
  console.log('toggle confirm:', confirmTitle, '|', confirmText.slice(0, 40));
  await page.screenshot({ path: path.resolve(__dirname, '../screenshots/task-frequency-toggle-confirm.png') });
  await page.click('[data-action="confirm-ok"]');
  await new Promise(r => setTimeout(r, 300));
  const r001Status = await page.$$eval('#rules-table-body tr', trs => {
    const tr = trs.find(t => t.children[0].textContent.trim() === 'R-001');
    return tr ? tr.children[4].textContent.trim() : '';
  });
  console.log('R-001 status after toggle:', r001Status);

  // 4) 完工项目页：组件含频率设置
  await page.goto(BASE + 'in-project-done.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  const doneLinks = await page.$$eval('#project-quick-links .disease-quick-link', as => as.map(a => a.textContent.trim()));
  const doneActive = await page.$eval('#project-quick-links .disease-quick-link.is-active', a => a.textContent.trim());
  console.log('done page quickLinks:', JSON.stringify(doneLinks), '| active:', doneActive);
  await page.screenshot({ path: path.resolve(__dirname, '../screenshots/project-done-quicklinks.png') });

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO_JS_ERRORS');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
