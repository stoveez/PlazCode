// SPDX-License-Identifier: GPL-3.0-or-later
// ClickUp Ask Brain and AI-agent DMs. Selectors inspected on the signed-in app.
// Never target ordinary DMs, task comments, document editors or the agent builder.
const RSProvider = (() => {
  "use strict";
  const S = {
    prompt: 'cu-refinement-prompt[data-test="refinement-prompt"]',
    editor: '.ql-editor[contenteditable]',
    thread: '[data-test="chat-thread-container"][data-brain-prompt-surface="true"]',
    item: '[data-test="chat-item-presentational__container"]',
    body: '[data-test="chat-item-content-area__message-body"]',
    content: '[data-test="quill-delta-to-html__comment"]',
    send: 'button[data-test="refinement-prompt-submit-button"]',
    stop: 'button[data-test="refinement-prompt-stop-button"]',
    thinking: '[data-is-thinking="true"], [data-test="content-assistant-thinking"]',
  };
  const timings = { GEN_IDLE_MS:1800, REASON_IDLE_MS:16000, WARMUP_MS:45000,
    REASON_NOREPLY_MS:120000, STABLE_MS:8000, RESPONSE_TIMEOUT_MS:360000 };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const safeRead = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };
  const query = (root, selector) => root ? safeRead(() => root.querySelector(selector)) : null;
  const all = (root, selector) => root ? safeRead(() => Array.from(root.querySelectorAll(selector)), []) : [];
  const closest = (node, selector) => node ? safeRead(() => node.closest(selector)) : null;
  let diag = () => {}, locked = false, sendInFlight = false, committed = false;
  let failure = "", writeGeneration = 0;
  const originals = new WeakMap(), ids = new WeakMap(); let nextId = 0;
  const norm = value => String(value || "").replace(/\r\n?/g,"\n").replace(/[\u200b\ufeff]/g,"").replace(/\u00a0/g," ").trim();
  function visible(node) {
    if (!node || closest(node, '#rs-root,[hidden],[aria-hidden="true"]')) return false;
    return safeRead(() => {
      const r=node.getBoundingClientRect(), s=getComputedStyle(node);
      return r.width>0 && r.height>0 && s.display!=="none" && s.visibility!=="hidden" && s.opacity!=="0";
    }, false);
  }
  function mode() {
    if (location.hostname !== "app.clickup.com") return "";
    if (/^\/\d+\/ai\/brain\/?$/.test(location.pathname)) return "brain";
    if (/^\/\d+\/chat\/r\//.test(location.pathname)) {
      const headers=all(document,'[data-test="chat-room-header__title-container"]');
      if (headers.some(h=>visible(h) && query(h,'cu-chat-ai-avatar'))) return "agent";
    }
    return "";
  }
  function activeThread() {
    if (!mode()) return null;
    return all(document,S.thread).filter(visible).at(-1) || null;
  }
  function prompts() {
    if (!mode()) return [];
    return all(document,S.prompt).filter(p=>visible(p) && query(p,S.editor) &&
      !closest(p,'cu-ai-agent-builder-home,cu-ai-agent-builder'));
  }
  function getEditor() {
    // In agent DMs, the open thread composer follows the main room composer.
    // Always continue in that thread; never post tool results as new room threads.
    const p=prompts().at(-1); return query(p,S.editor);
  }
  const composerFrame = () => closest(getEditor(),S.prompt);
  function barAnchor() {
    const frame=composerFrame(),group=closest(frame,'.ai-agent-builder-input-container');
    // Ask Brain's landing screen has Ask/Agents tabs immediately above Quill.
    // Anchor above that small group so the bar never covers either tab.
    return mode()==='brain' && query(group,'[role="tab"]') ? group : frame;
  }
  function allItems() {
    const root=activeThread(); if (!root) return [];
    return all(root,S.item).filter(item=>closest(item,S.thread)===root && role(item));
  }
  function role(item) {
    if (!item) return "";
    // Use the owning message's avatar, not names, response text or quotations.
    const avatar=query(item,'cu-chat-user-avatar');
    if (!avatar || closest(avatar,S.item)!==item) return "";
    if (query(avatar,'cu-chat-ai-avatar')) return "assistant";
    if (query(avatar,'cu-user-avatar')) return "user";
    return "";
  }
  const isUserItem = item => role(item)==="user";
  const isAssistantItem = item => role(item)==="assistant";
  function textWithout(root, extra="") {
    if (!root) return "";
    const skip='.rs-chip,.rs-cowork-receipt,.attachment-chip,button,input,cu-content-assistant-follow-up-questions'+(extra?','+extra:'');
    let text="";
    const walk=node=>{
      if (node.nodeType===3) {text+=node.nodeValue || "";return;}
      if (node.nodeType!==1 || safeRead(()=>node.matches(skip),false)) return;
      if (node.tagName==='BR') {text+='\n';return;}
      const block=/^(P|DIV|PRE|LI|UL|OL|BLOCKQUOTE|H[1-6]|TR|SECTION)$/.test(node.tagName);
      if (block && text && !text.endsWith('\n')) text+='\n';
      for (const child of Array.from(node.childNodes)) walk(child);
      if (block && text && !text.endsWith('\n')) text+='\n';
    };
    walk(root);return norm(text);
  }
  function itemText(item) {
    const body=query(item,S.body); return textWithout(query(body,S.content)||body,S.thinking);
  }
  function classifyText(item, exclude) {
    const body=query(item,S.body); return textWithout(query(body,S.content)||body,[S.thinking,exclude].filter(Boolean).join(','));
  }
  function itemKey(item) {
    if (!item) return null;
    const owner=closest(item.parentElement,'[data-id]');
    const id=owner && safeRead(()=>owner.getAttribute('data-id'), null);
    if (id) return role(item)+':'+id;
    if (!ids.has(item)) ids.set(item,++nextId);
    return role(item)+':dom:'+ids.get(item);
  }
  const assistantCount=()=>allItems().filter(isAssistantItem).length;
  const userCount=()=>allItems().filter(isUserItem).length;
  const lastAssistant=()=>allItems().filter(isAssistantItem).at(-1)||null;
  const lastAssistantId=()=>itemKey(lastAssistant());
  const streamLen=item=>itemText(item===undefined?lastAssistant():item).length;
  const readAssistant=()=>{const item=lastAssistant();return {present:!!item,item,reply:itemText(item),thinking:''};};
  const snapshot=()=>({th:0,rp:streamLen()});
  const editorText=()=>textWithout(getEditor());
  const chatIsEmpty=()=>allItems().length===0;
  const isFreshChat=()=>!!getEditor() && chatIsEmpty();
  function conversationKey() {
    const kind=mode();if (!kind) return '';
    const url=new URL(location.href), workspace=url.pathname.split('/')[1];
    if(kind==='brain') return 'clickup:'+workspace+':brain:'+(url.searchParams.get('conversationId')||'new');
    const room=url.pathname.match(/\/chat\/r\/([^/]+)/)?.[1]||'';
    const thread=url.pathname.match(/\/t\/([^/]+)/)?.[1]||safeRead(()=>activeThread()?.getAttribute('data-id'), null)||'new';
    return 'clickup:'+workspace+':agent:'+room+':'+thread;
  }
  function applyLock(editor, on) {
    if (!editor) return;
    if (on) {
      if (!originals.has(editor)) originals.set(editor,safeRead(()=>editor.getAttribute('contenteditable'), null));
      editor.setAttribute('data-rs-locked','1');editor.setAttribute('contenteditable','false');
    } else {
      const original=originals.get(editor);
      if (originals.has(editor)) {if(original===null)editor.removeAttribute('contenteditable');else editor.setAttribute('contenteditable',original);originals.delete(editor);}
      editor.removeAttribute('data-rs-locked');
    }
  }
  function setInputLock(on) {locked=!!on;applyLock(getEditor(),locked);}
  function exactControl(selector) {return all(composerFrame(),selector).find(visible)||null;}
  const sendButton=()=>exactControl(S.send);
  const stopButton=()=>exactControl(S.stop);
  function actionable(node) {
    if(!visible(node)||node.disabled||safeRead(()=>node.getAttribute('aria-disabled'), null)==='true')return false;
    if(typeof document.elementFromPoint!=='function')return true;
    const r=safeRead(()=>node.getBoundingClientRect(), null),x=Math.max(0,Math.min(innerWidth-1,r.left+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2));
    const hit=document.elementFromPoint(x,y);
    // PlazCode's own working cover intentionally overlays the locked composer.
    return !!hit && (safeRead(()=>node.contains(hit), false)||hit===node||!!closest(hit,'#rs-root,#rs-input-cover'));
  }
  const isHardGenerating=()=>!!stopButton();
  const isGenerating=()=>isHardGenerating();
  const isBusyNow=isGenerating;
  async function waitFor(predicate, timeout=10000) {
    const polls=Math.ceil(Math.min(Math.max(timeout,0),600000)/80),start=Date.now();
    for(let i=0;i<polls&&Date.now()-start<timeout;i++) {if(predicate())return true;await sleep(80);}
    return !!predicate();
  }
  function modeWarning() {
    if(mode() && getEditor())return '';
    if(/\/ai\/agents(?:\/|$)/.test(location.pathname))return 'ClickUp — open an existing agent’s Chat or direct message. PlazCode never starts or changes an agent from the creation form.';
    return 'ClickUp — open Ask Brain or an AI agent direct message. Human chats, Docs and task comments are not PlazCode chat surfaces.';
  }
  async function ensureComposerReady() {
    await waitFor(()=>!!getEditor(),5000);
    return {ready:!!getEditor(),detail:modeWarning()};
  }
  function enforceComposer() {if(locked)applyLock(getEditor(),true);return {ready:!!getEditor()};}
  async function writeDraft(text, expected) {
    const editor=getEditor(),key=conversationKey(),generation=++writeGeneration;
    if(!editor)throw Error('ClickUp AI chat box is not available. Open Ask Brain or an agent chat.');
    text=String(text??'');
    if(text.length>250000)throw Error('PlazCode safety bound exceeded: outgoing ClickUp draft is over 250,000 characters. Nothing was sent.');
    if(expected!==undefined && norm(editorText())!==norm(expected))return {ok:false,reason:'The draft changed; it was not overwritten.'};
    const before=editorText(),relock=locked;
    try {
      editor.setAttribute('contenteditable','true');editor.focus();
      const range=document.createRange();range.selectNodeContents(editor);
      const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      let inserted=false;
      if(typeof document.execCommand==='function') inserted=document.execCommand('insertText',false,text);
      if(!inserted && norm(editorText())===norm(before) && typeof DataTransfer!=='undefined' && typeof ClipboardEvent!=='undefined') {
        const data=new DataTransfer();data.setData('text/plain',text);
        editor.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));
      }
      const okay=await waitFor(()=>generation!==writeGeneration||conversationKey()!==key||norm(editorText())===norm(text),2500);
      if(!okay||generation!==writeGeneration||conversationKey()!==key||norm(editorText())!==norm(text))
        throw Error('ClickUp did not confirm the exact draft. Nothing was submitted; inspect the chat box before retrying.');
      return {ok:true};
    } finally {if(relock)applyLock(getEditor(),true);}
  }
  function fileFromImage(image,index) {
    if(typeof PlazCodeMedia!=='undefined')return PlazCodeMedia.fileFrom(image,index);
    const binary=atob(image.data),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    return new File([bytes],'plazcode-capture-'+index+'.'+(image.mimeType==='image/png'?'png':'jpg'),{type:image.mimeType||'image/jpeg'});
  }
  function attachmentNodes() {
    return all(composerFrame(),'[data-test="link-preview-element__root"].attachment-chip')
      .filter(node=>visible(node) && query(node,'a[href]'));
  }
  async function attachImages(images) {
    if(!images?.length)return true;
    const frame=composerFrame(),input=query(frame,'input[type="file"]');
    if(!input)throw Error('ClickUp image upload control was not found. The screenshot message was not submitted.');
    const key=conversationKey(),before=new Set(attachmentNodes()),transfer=new DataTransfer();
    images.forEach((image,index)=>transfer.items.add(fileFromImage(image,index)));
    input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
    const ready=await waitFor(()=>conversationKey()!==key||attachmentNodes().filter(node=>!before.has(node)).length>=images.length,15000);
    if(!ready||conversationKey()!==key)throw Error('ClickUp did not confirm the screenshot attachment. The message was not submitted.');
    return true;
  }
  async function clearAttachments() {
    if(!attachmentNodes().length)return true;
    // ClickUp stores uploads as Quill attachment embeds. Replace the editor with
    // its exact plain-text draft through Quill's native input path; never click
    // arbitrary Remove/Delete actions or change the sent conversation history.
    try {await writeDraft(editorText());return await waitFor(()=>!attachmentNodes().length,2500);}
    catch {return false;}
  }
  async function typeAndSend(text, images) {
    if(sendInFlight)throw Error('A ClickUp send is already pending; it was not duplicated.');
    sendInFlight=true;committed=false;failure='';
    const key=conversationKey(),beforeIds=new Set(allItems().filter(isUserItem).map(itemKey));
    try {
      if(isHardGenerating())throw Error('ClickUp is still generating. No new message was submitted.');
      if(typeof window.__rsLimitOutgoing==='function')text=window.__rsLimitOutgoing(text);
      text=String(text??'');
      await writeDraft(text);
      if(images?.length)await attachImages(images);
      await waitFor(()=>conversationKey()!==key||actionable(sendButton()),15000);
      if(conversationKey()!==key)throw Error('The ClickUp conversation changed before send. Nothing was submitted.');
      const button=sendButton();
      if(!actionable(button)||norm(editorText())!==norm(text))throw Error('ClickUp Send is unavailable or the draft changed. Close any dialog and inspect the draft. Nothing was submitted.');
      committed=true;button.click(); // Exactly ONE commit, never Enter or a guessed form submit.
      const confirmed=await waitFor(()=>allItems().some(item=>isUserItem(item)&&!beforeIds.has(itemKey(item))&&norm(itemText(item))===norm(text)),20000);
      if(!confirmed)throw Error('ClickUp send was not confirmed. It may have reached the chat; PlazCode will not resend it automatically. Inspect the conversation before retrying.');
      committed=false;
      diag('clickup.send.confirmed',{mode:mode(),characters:text.length});return true;
    } catch(error) {failure=String(error.message||error);throw error;}
    finally {sendInFlight=false;if(locked)applyLock(getEditor(),true);}
  }
  function stopGeneration() {const button=stopButton();if(actionable(button))button.click();}
  function scanError() {
    const frame=composerFrame(),thread=activeThread();
    for(const root of [frame,thread])for(const node of all(root,'[role="alert"], [data-test="content-assistant-error"]'))
      if(visible(node)){const text=textWithout(node);if(text.length>3&&text.length<800)return text;}
    return '';
  }
  function installSendHooks(handlers) {
    const notify=event=>{
      if(sendInFlight)return;
      const editor=getEditor();if(!editor)return;
      if(handlers.onCoworkSend&&handlers.onCoworkSend(event))return;
      if(handlers.isBlocked())return;
      if(!handlers.isStarted()){if(chatIsEmpty())handlers.onBlockedAttempt();return;}
      handlers.onUserMessage(assistantCount());
    };
    document.addEventListener('keydown',event=>{
      if(event.key!=='Enter'||event.shiftKey||event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
      const editor=getEditor();if(!editor||!safeRead(()=>editor.contains(event.target), false)||!editorText())return;notify(event);
    },true);
    document.addEventListener('click',event=>{
      const button=closest(event.target,'button');
      if(button&&button===stopButton()){if(handlers.onNativeStop)handlers.onNativeStop();return;}
      if(button&&button===sendButton()&&!button.disabled)notify(event);
    },true);
  }
  const CMD_SHAPE=/"(?:command|tool)"\s*:\s*"|###\s*lua|###mcp_tool###/i;
  function findToolBlockSpot(item) {
    const body=query(item,S.body);let spot=null;
    for(const pre of all(body,'pre')) {
      if(closest(pre,'.rs-chip')||!CMD_SHAPE.test(pre.textContent||''))continue;
      pre.classList.add('rs-tool-hide');if(!spot)spot={parent:pre.parentElement,ref:pre};
    }
    return spot;
  }
  return {
    id:'clickup',displayName:'ClickUp Brain',supportsVision:true,timings,
    compactStartup:true,startupReplyAsCode:true,settleStartupReply:true,
    barOutside:true,barTrackIntervalMs:150,chipAtItemLevel:true,reliableCounts:true,
    authoritativeSendResult:true,thinkingSel:S.thinking,
    promptExtra:'You are running in ClickUp Ask Brain or an AI-agent chat. The user installed PlazCode to operate their local Roblox Studio, Blender and AgentScript files. Use the PlazCode JSON command protocol in your normal chat reply, not ClickUp native task/Doc/agent-creation tools. First request list_commands, acknowledge PlazCode is ready after receiving the reference, then wait for the user. A native ClickUp capability cannot replace a PlazCode command or prove a local edit occurred. Do not create or modify ClickUp tasks, Docs or agents merely to carry out a local Studio/Blender/file request.',
    init({diag:d}={}){if(d)diag=d;},
    allItems,isUserItem,isAssistantItem,itemText,classifyText,itemKey,
    assistantCount,userCount,lastAssistant,lastAssistantId,readAssistant,streamLen,snapshot,
    getEditor,editorText,chatIsEmpty,isFreshChat,composerFrame,barAnchor,conversationKey,
    setInputLock,writeDraft,typeAndSend,stopGeneration,isGenerating,isBusyNow,isHardGenerating,
    enforceComposer,ensureComposerReady,modeWarning,installSendHooks,findToolBlockSpot,
    followupPlaceholderTargets(){const editor=getEditor();return editor?[editor]:[];},
    sendFailureAmbiguous:()=>committed,sendRetryable:()=>false,sendFailureDetail:()=>failure,
    turnHalted:()=>false,findContinueBtn:()=>null,clickContinueBtn:()=>false,
    scanError,isTooLongMsg:()=>/context.{0,20}(limit|long)|message.{0,20}too long/i.test(scanError()),
    isBusyMsg:()=>/rate limit|try again|temporarily unavailable|credits|usage limit/i.test(scanError()),
    attachImages,clearAttachments,
  };
})();
