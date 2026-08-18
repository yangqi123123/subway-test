const puppeteer = require('puppeteer-core');
const path = require('path');
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
(async()=>{
  const browser = await puppeteer.launch({ executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless:'new', args:['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({width:1600,height:950});
  page.on('pageerror', e=>console.log('[pageerror]', e.message));
  const dialogs=[]; page.on('dialog', async d=>{dialogs.push(d.message()); await d.dismiss();});
  await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html',{waitUntil:'networkidle0',timeout:20000});
  await sleep(2000);

  // 打开领用记录
  await page.evaluate(()=>document.querySelector('[data-action="usage-device"]').click());
  await sleep(500);
  console.log('弹窗标题:', await page.evaluate(()=>document.getElementById('device-detail-title').textContent));
  console.log('面板宽度:', await page.evaluate(()=>document.querySelector('#device-detail-mask .am-detail-dialog').getBoundingClientRect().width));
  console.log('筛选区单行(高度<60):', await page.evaluate(()=>{
    const f = document.querySelector('.usage-filter');
    return f.getBoundingClientRect().height + 'px -> ' + (f.getBoundingClientRect().height < 60);
  }));
  console.log('按钮顺序:', await page.evaluate(()=>
    Array.from(document.querySelectorAll('.usage-filter button')).map(b=>b.textContent.trim()).join(' | ')
  ));
  console.log('按钮同行:', await page.evaluate(()=>{
    const btns = Array.from(document.querySelectorAll('.usage-filter button'));
    const tops = btns.map(b=>b.getBoundingClientRect().top);
    return Math.max(...tops) - Math.min(...tops) < 2;
  }));
  await page.screenshot({ path: path.join(__dirname,'..','screenshots','track-usage-01-export.png') });

  // 导出（触发下载）
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(__dirname,'..','screenshots') });
  await page.evaluate(()=>document.querySelector('[data-action="usage-export"]').click());
  await sleep(800);
  console.log('导出后dialog:', dialogs[dialogs.length-1] || '(无弹窗，正常下载)');

  // 关闭后再开详情，面板宽度应恢复
  await page.evaluate(()=>document.querySelector('[data-action="close-device-detail"]').click());
  await sleep(300);
  await page.evaluate(()=>document.querySelector('[data-action="detail-device"]').click());
  await sleep(400);
  console.log('设备详情面板宽度:', await page.evaluate(()=>document.querySelector('#device-detail-mask .am-detail-dialog').getBoundingClientRect().width));
  await browser.close();
})().catch(e=>{console.error('fail',e.message);process.exit(1);});
