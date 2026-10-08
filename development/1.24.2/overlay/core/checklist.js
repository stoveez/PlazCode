// SPDX-License-Identifier: GPL-3.0-or-later
const PlazCodeChecklist = (() => {
  function mount({root, getGroup, getBar, blocked, storage}) {
    const key='plazcode.checklistHidden'; let collapsed=false, signature='';
    try { if(!storage)storage=window.sessionStorage;collapsed=storage.getItem(key)==='1'; } catch {}
    const panel=document.createElement('section');panel.id='rs-task-checklist';panel.hidden=true;panel.setAttribute('aria-label','Task checklist');
    panel.innerHTML='<header><span class="rs-checklist-ring" role="progressbar" aria-label="Task plan progress" aria-valuemin="0" aria-valuemax="100"><svg viewBox="0 0 32 32" aria-hidden="true"><circle class="rs-checklist-track" cx="16" cy="16" r="12"/><circle class="rs-checklist-fill" cx="16" cy="16" r="12" pathLength="100" stroke-dasharray="100" transform="rotate(-90 16 16)"/></svg><span class="rs-checklist-percent"></span></span><span class="rs-checklist-heading"><strong>Task checklist</strong><small></small></span><button type="button" class="rs-checklist-hide" aria-label="Hide task checklist" title="Hide checklist — the AI keeps working">−</button></header><ol></ol>';
    const tab=document.createElement('button');tab.id='rs-checklist-show';tab.type='button';tab.hidden=true;tab.textContent='☑ Tasks';tab.setAttribute('aria-label','Show task checklist');
    root.append(panel,tab);
    function setCollapsed(value) {
      collapsed=value;try{if(value)storage.setItem(key,'1');else storage.removeItem(key);}catch{}
      place();(value?tab:panel.querySelector('button')).focus({preventScroll:true});
    }
    panel.querySelector('button').onclick=()=>setCollapsed(true);tab.onclick=()=>setCollapsed(false);
    function render() {
      const group=getGroup();
      if (!group || !group.taskLabel) {panel.hidden=true;tab.hidden=true;return;}
      const items=group.plan?.items?.length ? group.plan.items : [{label:group.taskLabel,status:'pending'}];
      const completed=group.completed&&(!group.plan||group.plan.done===group.plan.total);
      const percent=completed?100:Math.round(100*(group.plan?group.plan.done/group.plan.total:0));
      const next=JSON.stringify([group.id,completed,group.ended,group.taskLabel,items,percent]);
      if(next!==signature){
        signature=next;panel.dataset.done=String(!!completed);
        panel.querySelector('.rs-checklist-percent').textContent=percent+'%';
        panel.querySelector('.rs-checklist-ring').setAttribute('aria-valuenow',String(percent));
        panel.querySelector('.rs-checklist-fill').style.strokeDashoffset=String(100-percent);
        panel.querySelector('small').textContent=completed?'Completed':group.ended?'Paused · plan progress':group.plan?'Plan progress':'Waiting for task steps';
        panel.querySelector('strong').title=group.taskLabel;
        const list=panel.querySelector('ol');list.replaceChildren();
        for(const item of items){const row=document.createElement('li'),icon=document.createElement('span'),label=document.createElement('span');const done=completed||item.status==='completed';row.dataset.status=done?'completed':item.status;icon.className='rs-checklist-mark';icon.textContent=done?'✓':item.status==='in_progress'?'◉':'○';icon.setAttribute('aria-hidden','true');label.textContent=item.label;row.setAttribute('aria-label',item.label+' — '+(done?'completed':item.status.replace('_',' ')));row.append(icon,label);list.append(row);}
      }
      place();
    }
    function place() {
      const group=getGroup(),bar=getBar(),rect=bar?.isConnected&&bar.style.display!=='none'?bar.getBoundingClientRect():null;
      const available=!!group?.taskLabel&&!!rect?.width&&rect.top>64&&!blocked();
      panel.hidden=!available||collapsed;tab.hidden=!available||!collapsed;
      if(!available)return;
      const element=collapsed?tab:panel,width=collapsed?94:Math.min(300,window.innerWidth-16);
      element.style.width=width+'px';element.style.left=Math.max(8,Math.min(window.innerWidth-width-8,rect.right-width))+'px';element.style.bottom=(window.innerHeight-rect.top+8)+'px';
      panel.style.maxHeight=Math.max(48,Math.min(330,rect.top-16))+'px';
      panel.style.setProperty('--rs-checklist-space',Math.max(48,Math.min(330,rect.top-16))+'px');
    }
    return {render,place,setCollapsed,panel,tab};
  }
  return {mount};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=PlazCodeChecklist;
