"""Compile offline UI catalogs. Missing translations fail a production build."""
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parent/'overlay/core';folder=root/'locales'
codes=['en','es','fr','ru','ar','zh-CN','zh-TW','ja','ko','de','pt-BR','it','hi','tr']
keys=json.loads((folder/'en.json').read_text());result={'en':{k:k for k in keys}}
for code in codes[1:]:
 p=folder/(code+'.json')
 if not p.exists() and '--allow-incomplete' in sys.argv:result[code]={};continue
 data=json.loads(p.read_text());assert data.keys()==keys.keys(),code+' incomplete keys'
 assert all(isinstance(v,str) and v.strip() for v in data.values()),code+' blank translation'
 assert not any(any(0x202a<=ord(c)<=0x202e or 0x2066<=ord(c)<=0x2069 for c in v) for v in data.values()),code+' unexpected bidi control'
 result[code]=data
out=root/'i18n-catalog.js';out.write_text('// SPDX-License-Identifier: GPL-3.0-or-later\n// Generated offline from core/locales; no user content or network translation.\nglobalThis.PlazCodeLocaleData='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(keys),'UI keys;',len(result),'languages;',out.stat().st_size,'bytes')
