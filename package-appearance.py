from pathlib import Path
import json,zipfile,hashlib,io,plistlib,struct,urllib.request,tarfile,subprocess,shutil
repo=Path.cwd();version='1.19.38';root=repo/'build/PlazCode'
notes=json.loads((root/'release-notes.json').read_text());entry=notes[0];assert entry['version']==version
intro='PlazCode '+version+' — '+entry['title']+'\n\n'+entry['summary']+'\n\n'+'\n'.join('- '+x for key in ['added','improved','fixed'] for x in entry[key])+'\n\n'
validation='PlazCode 1.19.38 validation\nNotion Start agent: the start handshake now adopts a provisional agent after 5 s instead of waiting indefinitely, and restarting from a chat with no agent no longer waits for the old run; the Notion startup, pending-start, startup-lock and protocol-retry tests pass.\nBar placement: test-notion-bar-follow.js verifies the PlazCode bar stays directly above the Notion chat box and follows it when the chat box moves or resizes.\nChatGPT tools: test-tool-guard-repair.js covers repairing malformed tool calls (stray characters, wrapped JSON, wrong argument shapes) before they reach the tool, so creation tools no longer fail on recoverable input.\nGit MCP: Rust tests cover the corrected Git MCP add-on launch.\nAuto updater: the Rust updater retries the feed and no longer defers installing a detected update indefinitely; Rust updater tests pass.\nRegression: all 86 JavaScript test files and the full cargo test suite (91 tests) pass locally on Windows.\nNot exercised: live signed-in AI chats, a real Mac, Firefox or Edge on a tester machine, real Roblox Studio and a user installation.\n\n'
firefox_note='## Firefox page events (maintainers)\n\nFirefox hides DataTransfer data/files created by content scripts from page handlers and ignores clipboardData in the ClipboardEvent constructor. The Firefox package therefore adds core/firefox-events.js (first script in each isolated content-script group) and core/firefox-events-main.js (a MAIN-world entry with the same matches). Synthetic paste, drag/drop and input events that carry text or files are rebuilt in the page world; native events and events without data use the normal dispatch. release-tools/build-firefox.py inserts both entries; the Chromium manifest and scripts do not load them. firefox-transfer-check.js verifies Notion protocol upload, inline paste, Co-Work draft clearing and helper semantics in real Firefox (--without-shim reproduces the original failure).\n\n'
for name in ['README.md','UPDATE.txt','MAINTENANCE.md']:
 body=(repo/name).read_text().replace('PlazCode-Firefox-1.19.37.zip','PlazCode-Firefox-'+version+'.zip')
 (repo/name).write_text(intro+(firefox_note if name=='MAINTENANCE.md' and firefox_note not in body else '')+body);(root/name).write_bytes((repo/name).read_bytes())
(repo/'VALIDATION.txt').write_text(validation+(repo/'VALIDATION.txt').read_text());(root/'VALIDATION.txt').write_bytes((repo/'VALIDATION.txt').read_bytes())
(repo/'release-notes.json').write_bytes((root/'release-notes.json').read_bytes())
(repo/'Update-PlazCode.ps1').write_bytes((root/'Update-PlazCode.ps1').read_bytes())
(repo/'publish_release.py').write_bytes((repo/'publisher-appearance.py').read_bytes())
assets=[('windows_amd64.zip','windows-amd64.exe','bb410e4a578bee96888f848764dbbf9e7dd78971204c05bb7fb81a4a8db324a3'),('darwin_amd64.tar.gz','darwin-amd64','68cc3eebbb265d1c45999a429d1e6774150ba71ac008f4dd381b9d73b10c79dd'),('darwin_arm64.tar.gz','darwin-arm64','54e080ed64a1d1b7b8a5d59e5a6d17100adbd69a6aafbb73d270dbeb37c03266')]
for suffix,name,sha in assets:
 with urllib.request.urlopen('https://github.com/Gentleman-Programming/engram/releases/download/v3.0.0/engram_3.0.0_'+suffix,timeout=60) as r:raw=r.read(12*1024*1024)
 assert hashlib.sha256(raw).hexdigest()==sha,(suffix,'Official Engram archive checksum mismatch')
 if suffix.endswith('.zip'):
  with zipfile.ZipFile(io.BytesIO(raw)) as z:data=z.read(next(n for n in z.namelist() if Path(n).name=='engram.exe'))
 else:
  with tarfile.open(fileobj=io.BytesIO(raw),mode='r:gz') as t:data=t.extractfile(next(n for n in t.getmembers() if Path(n.name).name=='engram')).read()
 if name.startswith('windows'):
  p=root/'runtime/engram'/('engram-'+name);p.write_bytes(data);p.chmod(0o755)
(root/'runtime/engram/SHA256SUMS.txt').write_text(''.join(f'{sha}  engram_3.0.0_{suffix}\n' for suffix,name,sha in assets))
with zipfile.ZipFile(repo/'artifacts/native-macOS/PlazCode-app.zip') as app:
 plist=plistlib.loads(app.read('PlazCode.app/Contents/Info.plist'));assert plist['CFBundleShortVersionString']==version
 binary=app.read('PlazCode.app/Contents/MacOS/PlazCode');assert binary[:4]==bytes.fromhex('cafebabe')
 count=struct.unpack('>I',binary[4:8])[0];assert {0x01000007,0x0100000c}.issubset({struct.unpack('>I',binary[8+i*20:12+i*20])[0] for i in range(count)})
 appentries={f'PlazCode/{i.filename}':(i,app.read(i)) for i in app.infolist() if not i.is_dir()}
p=root/'macos/Info.plist';data=plistlib.loads(p.read_bytes());data['CFBundleShortVersionString']=data['CFBundleVersion']=version;p.write_bytes(plistlib.dumps(data))
source={f'PlazCode/{p.relative_to(root)}':p.read_bytes() for p in root.rglob('*') if p.is_file() and not any(x in p.relative_to(root).parts for x in ['target','.git','node_modules','__pycache__','PlazCode.app','visual-checks'])}
source['PlazCode/PlazCode.exe']=(repo/'artifacts/native-Windows/PlazCode.exe').read_bytes()
original=repo/'PlazCode-1.19.37.zip';assert hashlib.sha256(original.read_bytes()).hexdigest()=='70258e0e9ffa7c3aeca47c56d89ba64997f9766fb6b5e44e6579051106a615a2'
with urllib.request.urlopen('https://raw.githubusercontent.com/stoveez/PlazCode/33f5aa75003cf5b71905d8745e086666f804f0e1/PlazCode-source-1.19.37.zip', timeout=60) as response: baseline_source=response.read(8*1024*1024)
assert hashlib.sha256(baseline_source).hexdigest()=='a6da0416608ff769470f49d272cdee3e56c9f7f50c40305882c3abb1e38d0fd0'
with zipfile.ZipFile(io.BytesIO(baseline_source)) as old:
 for path in source:
  if '/providers/' in path and path in old.namelist() and not path.endswith(('/providers/notion.js',)):assert source[path]==old.read(path), 'Unrelated provider behavior source changed'
source_name=f'PlazCode-source-{version}.zip'
with zipfile.ZipFile(repo/source_name,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for path,data in source.items():
  if path.endswith(('.exe','.dll','.pdb')) or '/runtime/engram/engram-' in path:continue
  z.writestr(path,data)
 for name in ['package-appearance.py','publisher-appearance.py','.github/workflows/appearance-build.yml','appearance-visual.js','test-javascript.py']:
  p=repo/name
  if not p.exists():
   with urllib.request.urlopen(f'https://raw.githubusercontent.com/{__import__("os").environ["GITHUB_REPOSITORY"]}/{__import__("os").environ["GITHUB_SHA"]}/{name}',timeout=30) as response: data=response.read()
  else:data=p.read_bytes()
  z.writestr('PlazCode/release-tools/'+name,data)
subprocess.run(['node',str(root/'release-tools/minify.mjs'),str(root)],check=True)
for path in list(source):
 p=root/path.removeprefix('PlazCode/')
 if p.is_file() and p.suffix=='.js':source[path]=p.read_bytes()
source['PlazCode/production-build.json']=(root/'production-build.json').read_bytes()
firefox_name=f'PlazCode-Firefox-{version}.zip'
subprocess.run(['python',str(root/'release-tools/build-firefox.py'),str(root/'PlazCode-Extension'),str(root/'PlazCode-Extension-Firefox'),str(repo/firefox_name)],check=True)
for path in (root/'PlazCode-Extension-Firefox').rglob('*'):
 if path.is_file():source['PlazCode/'+path.relative_to(root).as_posix()]=path.read_bytes()

# Run pure behavioral tests against the actual generated modules.
for name in ['test-version.js','test-cowork.js','test-page-startup.js','test-cowork-injection-composer.js','test-cowork-notion-plain-text.js','test-notion-tool-status.js','test-notion-localized-composer.js','test-notion-send-receipts.js','test-studio-status.js','test-clarification.js','test-blender-command-results.js','test-firefox-package.js','test-parser-key-order.js','test-bar-hide.js','test-notion-bar-seat.js','test-notion-bar-follow.js','test-tool-guard-repair.js']:
 subprocess.run(['node',name],cwd=root,check=True)
def development(path):
 relative=path.removeprefix('PlazCode/');parts=Path(relative).parts
 return any(p in ['.git','.github','node_modules','__pycache__','release-tools'] for p in parts) or any(p.startswith('test-') for p in parts) or relative.startswith('agent/src/') or relative in ['agent/Cargo.toml','agent/Cargo.lock','agent/build.rs','build-macos-bundle.py','package_release.py','design-baseline.html','firefox-runtime-check.js'] or Path(path).suffix in ['.map','.pdb']
metadata=[]
for platform,name in [('windows',f'PlazCode-{version}.zip'),('macos',f'PlazCode-macOS-{version}.zip')]:
 output=repo/name;remaining=dict(source)
 with zipfile.ZipFile(original) as old,zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as new:
  seen=set()
  for info in old.infolist():
   path=info.filename
   if development(path):remaining.pop(path,None);continue
   if path.startswith('PlazCode/PlazCode.app/'):continue
   if platform=='macos' and Path(path).suffix.lower() in ['.exe','.dll','.bat','.cmd','.ps1']:continue
   data=remaining.pop(path,old.read(info))
   if path=='PlazCode/update-source.json' and platform=='macos':data=json.dumps({'feedUrl':'https://raw.githubusercontent.com/stoveez/PlazCode/main/latest-macos.json'},indent=2).encode()
   new.writestr(info,data);seen.add(path)
  for path,data in remaining.items():
   if development(path):continue
   if path in seen or path.startswith('PlazCode/PlazCode.app/'):continue
   if platform=='macos' and Path(path).suffix.lower() in ['.exe','.dll','.bat','.cmd','.ps1']:continue
   info=zipfile.ZipInfo(path);info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=(0o100755 if Path(path).suffix=='.command' or '/runtime/engram/engram-' in path else 0o100644)<<16;new.writestr(info,data)
  for path,(oldinfo,data) in appentries.items():
   info=zipfile.ZipInfo(path);info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=oldinfo.external_attr;new.writestr(info,data)
 with zipfile.ZipFile(output) as z:
  assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
  for path in ['PlazCode/manifest.json','PlazCode/PlazCode-Extension/manifest.json']:
   manifest=json.loads(z.read(path));assert manifest['version']==version and manifest.get('version_name',version)==version
  assert ('PlazCode/PlazCode.exe' in z.namelist())==(platform=='windows')
  assert ('PlazCode/runtime/engram/engram-windows-amd64.exe' in z.namelist())==(platform=='windows')
  for arch in ['amd64','arm64']:assert z.getinfo(f'PlazCode/PlazCode.app/Contents/Resources/engram/engram-darwin-{arch}').external_attr>>16&0o111
  assert z.getinfo('PlazCode/PlazCode.app/Contents/MacOS/PlazCode').external_attr>>16&0o111
  assert not any(development(path) for path in z.namelist()), 'Development artifacts in production ZIP'
  for base in ['PlazCode/','PlazCode/PlazCode-Extension/']:
   manifest=json.loads(z.read(base+'manifest.json'))
   required=[manifest['background']['service_worker'],manifest['action']['default_popup']]
   for content in manifest['content_scripts']:required+=content.get('js',[])+content.get('css',[])
   for path in required:assert base+path in z.namelist(),('Missing production asset',base+path)
 raw=output.read_bytes();assert len(raw)<=64*1024*1024
 metadata.append({'file':name,'platform':platform,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
raw=(repo/source_name).read_bytes();source_metadata={'file':source_name,'platform':'source','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
firefox_raw=(repo/firefox_name).read_bytes();firefox_metadata={'file':firefox_name,'platform':'firefox','bytes':len(firefox_raw),'sha256':hashlib.sha256(firefox_raw).hexdigest()}
with zipfile.ZipFile(repo/firefox_name) as archive:
 assert archive.testzip() is None and 'manifest.json' in archive.namelist()
 m=json.loads(archive.read('manifest.json'));assert m['version']==version and m['background']=={'scripts':['background.js']} and m['browser_specific_settings']['gecko']['id']=='plazcode@plazcode.local'
 for key in ['background.js','core/main.js','providers/notion.js','popup.js']:assert archive.read(key)==source['PlazCode/PlazCode-Extension/'+key]
feeds={x['platform']:{'version':version,'desktop_version':version,'url':f"https://raw.githubusercontent.com/stoveez/PlazCode/main/{x['file']}",'sha256':x['sha256'],'release_notes':notes} for x in metadata}
feeds['windows']['platforms']={'macos':{k:feeds['macos'][k] for k in ['url','sha256']}}
for feed in feeds.values():
 while len((json.dumps(feed,indent=2)+'\n').encode())>60000 and len(feed['release_notes'])>1:feed['release_notes']=feed['release_notes'][:-1]
 assert len((json.dumps(feed,indent=2)+'\n').encode())<=65536
(repo/'latest.json').write_text(json.dumps(feeds['windows'],indent=2)+'\n');(repo/'latest-macos.json').write_text(json.dumps(feeds['macos'],indent=2)+'\n')
(repo/'SHA256SUMS.txt').write_text(''.join(f"{x['sha256']}  {x['file']}\n" for x in metadata+[source_metadata,firefox_metadata]));(repo/'release-metadata.json').write_text(json.dumps(metadata+[source_metadata,firefox_metadata],indent=2)+'\n')
description='**PlazCode '+version+': '+entry['title']+'**\n\n- '+entry['summary']+'\n'
for key,title in [('added','New additions'),('improved','Improvements'),('fixed','Bug fixes')]:
 description+='\n***'+title+'***\n\n'+('\n'.join('- '+x for x in entry[key]) or '- None.')+'\n'
(repo/'release-description-1.19.38.txt').write_text(description)
print(json.dumps(metadata,indent=2))
