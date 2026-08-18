const puppeteer = require('puppeteer-core');
const path = require('path');
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
(async()=>{
  const browser = await puppeteer.launch({ executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless:'new', args:['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({width:1600,height:950});
  page.on('pageerror', e=>console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8090/web/wb/wb-sys-notify.html',{waitUntil:'networkidle0',timeout:20000});
  await sleep(2500);

  console.log('类型筛选项:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('[data-filter="type"] option')).map(o=>o.textContent).join(',')
  ));

  console.log('前2行:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('table tbody tr')).slice(0,2).map(tr=>{
      const tds = tr.querySelectorAll('td');
      return tds[0].textContent.trim().slice(0,46) + ' || ' + tds[1].textContent.trim() + ' || ' + tds[2].textContent.trim();
    }).join('\n')
  ));

  // 按设备领用筛选
  await page.select('[data-filter="type"]', '设备领用');
  await page.evaluate(()=>{
    const btn = Array.from(document.querySelectorAll('button')).find(b=>/搜索|查询|筛/.test(b.textContent));
    if (btn) btn.click();
  });
  await sleep(600);
  console.log('设备领用筛选行数:', await page.evaluate(()=>document.querySelectorAll('table tbody tr').length));
  await page.screenshot({ path: path.join(__dirname,'..','screenshots','sys-notify-01-filter.png') });

  // 点击第一条【查看】
  await page.evaluate(()=>{
    const tr = document.querySelector('table tbody tr');
    const act = Array.from(tr.querySelectorAll('.wb-action, span, a')).find(el=>el.textContent.trim()==='查看');
    act.click();
  });
  await sleep(600);
  console.log('详情含通知类型:', await page.evaluate(()=>document.getElementById('wb-modal-body').textContent.includes('通知类型')));
  console.log('详情含设备领用:', await page.evaluate(()=>document.getElementById('wb-modal-body').textContent.includes('设备领用')));
  console.log('详情字段:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('#wb-modal-body .wb-notify-detail-key')).map(k=>k.textContent.trim()).join(',')
  ));
  await page.screenshot({ path: path.join(__dirname,'..','screenshots','sys-notify-02-detail.png') });
  await browser.close();
})().catch(e=>{console.error('fail',e.message);process.exit(1);});
