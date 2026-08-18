const puppeteer = require('puppeteer-core');
const path = require('path');
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
(async()=>{
  const browser = await puppeteer.launch({ executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless:'new', args:['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({width:1440,height:900});
  page.on('pageerror', e=>console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html',{waitUntil:'networkidle0',timeout:20000});
  await sleep(2000);

  console.log('列表表头:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('table thead th')).map(th=>th.textContent.trim()).join(' | ')
  ));
  console.log('列表含产地:', await page.evaluate(()=>document.querySelector('table').textContent.includes('产地')));

  // 新增弹窗：备注应为单行输入框，且与厂家同行（top 相同）
  await page.evaluate(()=>document.querySelector('[data-action="new-device"]').click());
  await sleep(400);
  console.log('新增含产地:', await page.evaluate(()=>document.getElementById('device-modal-mask').textContent.includes('产地')));
  console.log('备注是input:', await page.evaluate(()=>document.getElementById('device-remark').tagName === 'INPUT'));
  console.log('备注与厂家同行:', await page.evaluate(()=>{
    const m = document.getElementById('device-maker').closest('.device-form-item').getBoundingClientRect();
    const r = document.getElementById('device-remark').closest('.device-form-item').getBoundingClientRect();
    return Math.abs(m.top - r.top) < 2;
  }));
  await page.screenshot({ path: path.join(__dirname, '..', 'screenshots', 'track-device-add-no-origin.png') });
  await page.evaluate(()=>document.querySelector('[data-action="close-device-modal"]').click());
  await sleep(300);

  // 编辑弹窗：备注回填 + 保存
  await page.evaluate(()=>document.querySelector('[data-action="edit-device"]').click());
  await sleep(400);
  console.log('编辑备注回填:', await page.evaluate(()=>document.getElementById('device-remark').value));
  await page.evaluate(()=>document.querySelector('[data-action="save-device"]').click());
  await sleep(400);
  console.log('编辑保存无报错');
  await browser.close();
})().catch(e=>{console.error('fail',e.message);process.exit(1);});
