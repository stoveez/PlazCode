const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{JSDOM}=require('jsdom');
let level='default';const ctx=vm.createContext({window:{__rsThinkingLevel:()=>level},console});
vm.runInContext(fs.readFileSync('core/ultracode.js','utf8')+'\n'+fs.readFileSync('core/config.js','utf8')+'\nthis.RS=RS;',ctx);
for(const engine of ['roblox','local']){
 for(const selected of ['default','low','mid','high','max']){level=selected;assert(!ctx.RS.buildSystemPrompt({engine}).includes('ULTRACODE (BETA)'));}
 level='ultracode';const prompt=ctx.RS.buildSystemPrompt({engine});assert(prompt.includes('ULTRACODE (BETA)'));assert(prompt.includes('THINK=ultracode'));assert(prompt.includes('smallest complete change'));
 if(engine==='roblox'){for(const name of ['server-authority','docs-lookup','toolbox','project-layout','map-placement','tunables-config','remote-events','roblox-gotchas','review-for-exploits','report-what-you-verified'])assert(prompt.includes('Skill: '+name));assert(prompt.includes('PlazCode CAN inspect and test'));assert(!prompt.includes('You cannot run Studio from here'));}
 else assert(!prompt.includes('Skill: map-placement'));
 level='default';assert(!ctx.RS.buildSystemPrompt({engine}).includes('ULTRACODE (BETA)'));
}
const manifest=JSON.parse(fs.readFileSync('manifest.json'));
for(const item of manifest.content_scripts.filter(s=>s.js.includes('core/config.js')))assert(item.js.indexOf('core/ultracode.js')<item.js.indexOf('core/config.js'));
for(const path of ['popup.html','agent/src/desktop.html']){
 const dom=new JSDOM(fs.readFileSync(path,'utf8'));const select=[...dom.window.document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.value==='ultracode'));assert(select);assert.equal(select.options[select.selectedIndex+5]?.value,'ultracode');const options=[...select.options];assert.equal(options[options.findIndex(o=>o.value==='max')+1].textContent,'Ultracode (Beta)');dom.window.close();
}
const desktop=fs.readFileSync('agent/src/desktop.html','utf8');assert(!desktop.includes('<option value="solar">'));assert(!desktop.includes('data-desktop-palette="solar"'));assert(!desktop.includes('PlazCode Orange'));
const dom=new JSDOM(desktop),d=dom.window.document,style=d.documentElement.style;
const begin=desktop.indexOf('  var Desktopthemes ='),end=desktop.indexOf('  function Saveappearance()',begin);
const box=vm.createContext({document:d,Byid:id=>d.getElementById(id)});vm.runInContext(desktop.slice(begin,end),box);
for(const theme of ['default','solar']){const value=box.Applyappearance({theme,glow:'strong',gradients:'off'});assert.equal(value.theme,'default');assert.equal(style.getPropertyValue('--orange'),'#e9ba53');assert.equal(d.documentElement.dataset.desktopTheme,'default');assert.equal(value.glow,'strong');assert.equal(value.gradients,'off');}
box.Applyappearance({theme:'cyan'});assert.equal(style.getPropertyValue('--orange'),'#27c1e7');dom.window.close();
const popup=fs.readFileSync('popup.js','utf8'),a=popup.indexOf('const POPUP_PALETTES'),b=popup.indexOf('const ENGINE_KEY',a),vars={},root={dataset:{},style:{setProperty:(k,v)=>vars[k]=v}},p=vm.createContext({document:{documentElement:root}});vm.runInContext(popup.slice(a,b),p);p.applyPopupAppearance({theme:'solar',glow:'strong',gradients:'off'});assert.equal(root.dataset.palette,'default');assert.equal(vars['--accent'],'#e9ba53');assert.equal(root.dataset.glow,'strong');
console.log('PASS Ultracode activation/deactivation, engine-aware instructions, all dropdowns/load order, new Default theme and Solar Dusk migration.');
