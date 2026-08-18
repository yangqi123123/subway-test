const puppeteer = require('puppeteer-core');
const path = require('path');
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
(async()=>{
  const browser = await puppeteer.launch({ executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless:'new', args:['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('pageerror', e=>console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8090/app/mine/pages/notify.html',{waitUntil:'networkidle0',timeout:20000});
  await sleep(2500);

  console.log('前2张卡片:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('.mp-wb-card')).slice(0,2).map(c=>{
      const rows = Array.from(c.querySelectorAll('.mp-wb-card__row')).map(r=>r.textContent.trim()).join(' ');
      return c.querySelector('.mp-wb-card__title').textContent.trim().slice(0,44) + ' || ' + rows;
    }).join('\n')
  ));

  console.log('筛选类型选项:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('#wb-filter-type option')).map(o=>o.value).join(',')
  ));

  // 筛选设备领用
  await page.select('#wb-filter-type', '设备领用');
  await page.evaluate(()=>document.querySelector('[data-action="search-wb-filter"]').click());
  await sleep(600);
  console.log('设备领用筛选卡片数:', await page.evaluate(()=>document.querySelectorAll('.mp-wb-card').length));
  await page.screenshot({ path: path.join(__dirname,'..','screenshots','mp-notify-01-device-filter.png') });

  // 打开第一条详情
  await page.evaluate(()=>document.querySelector('.mp-wb-card [data-action="wb-view"]').click());
  await sleep(600);
  console.log('详情字段:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('#wb-detail-body dt')).map(dt=>dt.textContent.trim()).join(',')
  ));
  console.log('详情含设备领用:', await page.evaluate(()=>document.getElementById('wb-detail-body').textContent.includes('设备领用')));
  await page.screenshot({ path: path.join(__dirname,'..','screenshots','mp-notify-02-device-detail.png') });
  await browser.close();
})().catch(e=>{console.error('fail',e.message);process.exit(1);});
