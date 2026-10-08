const {chromium,firefox}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const clean=path=>fs.readFileSync(path,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
(async()=>{for(const [name,engine] of [['chromium',chromium],['firefox',firefox]]){
 const browser=await engine.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [path,mode,theme,glow,gradients,target] of [
  ['agent/src/desktop.html','desktopThinking','desktopTheme','desktopGlow','desktopGradients','.navbtn.active'],
  ['popup.html','thinking','palette','glow','gradients','#reasoning-level'],
  ['overlay.css','rsThinking','rsPalette','rsGlow','rsGradients','#rs-bar']]){
  await page.setContent(path.endsWith('.css')?'<style>'+fs.readFileSync(path,'utf8')+'</style><div id="rs-root"><div id="rs-bar"><button id="rs-action" data-kind="start">Start</button></div></div>':clean(path));
  await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important}'});
  for(const palette of ['default','cyan','rose','violet']){
   await page.evaluate(({mode,theme,glow,gradients,palette})=>{const r=document.documentElement;r.dataset[theme]=palette;r.dataset[mode]='max';r.dataset[glow]='subtle';r.dataset[gradients]='on';r.dataset.rsTheme='night';r.dataset.theme='night';r.style.setProperty('--pc-bg','#18140d');r.style.setProperty('--pc-rgb','233 186 83');r.style.setProperty('--pc-accent','#e9ba53');r.style.setProperty('--pc-light','#ffe0a1');r.style.setProperty('--pc-glow-strength','.16');}, {mode,theme,glow,gradients,palette});
   const before=await page.evaluate(target=>{const s=getComputedStyle(document.querySelector(target));return {border:s.borderColor,bg:getComputedStyle(document.body).backgroundColor};},target);
   await page.evaluate(mode=>document.documentElement.dataset[mode]='ultracode',mode);
   const after=await page.evaluate(({target,theme})=>({border:getComputedStyle(document.querySelector(target)).borderColor,bg:getComputedStyle(document.body).backgroundColor,palette:document.documentElement.dataset[theme]}),{target,theme});
   assert.notEqual(after.border,before.border,path);assert.equal(after.bg,before.bg,path);assert.equal(after.palette,palette);
   await page.evaluate(({glow,gradients})=>{document.documentElement.dataset[glow]='off';document.documentElement.dataset[gradients]='off';},{glow,gradients});
   assert.equal(await page.evaluate(target=>getComputedStyle(document.querySelector(target)).boxShadow,target),'none',path);
   await page.evaluate(({mode,glow,gradients})=>{document.documentElement.dataset[mode]='max';document.documentElement.dataset[glow]='subtle';document.documentElement.dataset[gradients]='on';},{mode,glow,gradients});
   assert.equal(await page.evaluate(target=>getComputedStyle(document.querySelector(target)).borderColor,target),before.border,path);
  }
 }
 await browser.close();console.log('PASS '+name+' purple activation, palette/background preservation, glow-off and deactivation on desktop/popup/bar.');
}})().catch(e=>{console.error(e);process.exit(1);});
