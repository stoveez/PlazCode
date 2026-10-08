const assert=require('node:assert/strict'),C=require('./core/chat-creators.js');
const save={action:'save',build_id:'cow-1',status:'building',blueprint:{root_id:'root',nodes:[{id:'root',class:'Model'}]}};
let result=C.recoverPreview('Plan proportions.\n```json\n'+JSON.stringify(save)+'\n```',true);
assert.equal(result.tool,'creation_preview');assert.equal(result.arguments.blueprint.build_id,'cow-1');assert.equal(result.arguments.status,'building');
assert.equal(C.recoverPreview(JSON.stringify(save),false),null);
for(const text of ['```json\n'+JSON.stringify(save)+'\n```\n```json\n{}\n```','{"action":"save",','Some prose '+JSON.stringify(save),JSON.stringify({...save,command:'execute_luau'}),JSON.stringify({...save,blueprint:{...save.blueprint,build_id:'other'}}),JSON.stringify({...save,action:'insert'})])assert.equal(C.recoverPreview(text,true),null,text);
assert.equal(C.recoverPreview(JSON.stringify({command:'creation_preview',params:save}),true),null);
console.log('PASS: active creator raw save recovery, identity conflicts, competing JSON and no automatic insertion.');
