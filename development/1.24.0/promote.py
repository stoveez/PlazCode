"""Promote only successful exact-source artifacts; never overwrite release archives."""
from pathlib import Path
import importlib.util,json,os,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
VERSION='1.24.0'
spec=importlib.util.spec_from_file_location('archive_tools',ROOT/'development/1.23.0/promote.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a);a.VERSION=VERSION

def find(name,platform):
    matches=list((ROOT/'ci-artifacts'/('plazcode-1.24-'+platform+'-validation')).rglob(name))
    assert len(matches)==1,(name,matches)
    return matches[0]

def main():
    base=os.environ['VALIDATED_SHA'];run=a.load(ROOT/'ci-artifacts/run.json');jobs=a.load(ROOT/'ci-artifacts/jobs.json')['jobs']
    assert run['head_sha']==base and run['status']=='completed' and run['conclusion']=='success'
    assert {j['name'] for j in jobs}=={'browsers','native (ubuntu-latest)','native (windows-latest)','native (macos-latest)'}
    assert all(j['conclusion']=='success' for j in jobs)
    windows=a.unpack(find('PlazCode-1.24.0-development.zip','Windows'));mac=a.unpack(find('PlazCode-macOS-1.24.0-development.zip','macOS'))
    for name,value in windows.items():
        if name.startswith(('PlazCode/core/','PlazCode/providers/','PlazCode/PlazCode-Extension/')):assert mac[name][0]==value[0],name
    firefox=a.firefox_text(a.unpack(find('PlazCode-Firefox-1.24.0-development.zip','Windows')))
    other=a.firefox_text(a.unpack(find('PlazCode-Firefox-1.24.0-development.zip','macOS')))
    assert {n:v[0] for n,v in firefox.items()}=={n:v[0] for n,v in other.items()}
    source=a.unpack(find('PlazCode-source-1.24.0-development.zip','macOS'));other=a.unpack(find('PlazCode-source-1.24.0-development.zip','Windows'))
    for files in [source,other]:
        for name in list(files):
            if name.startswith('PlazCode/visual-checks/') or Path(name).name in {'windows-signature.txt','defender-result.txt','defender-package-sha256.txt','defender-engine.json','defender-executable-sha256.txt'}:del files[name]
    assert {n:v[0] for n,v in source.items()}=={n:v[0] for n,v in other.items()}
    entry=a.load(Path(__file__).with_name('release-entry.json'));notes=[entry]+[n for n in a.load(ROOT/'release-notes.json') if n['version']!=VERSION]
    a.write_json(ROOT/'release-notes.json',notes)
    defender=find('defender-result.txt','Windows').read_text(encoding='utf-8-sig').strip();assert defender
    validation=f'''PlazCode {VERSION}\nSource: {base}\nCI: {run['html_url']}\nAll platform Rust/JavaScript regressions and Chromium/Firefox fixtures passed.\nWindows PE/updater/icon checks and real automatic update download/checksum/handoff checks passed. Mac x86_64/arm64, ad-hoc codesign and real automatic update handoff checks passed.\nShared service protocol and SQL tests passed; private-field reports and unauthorized retraction were rejected by the live API.\nAutomatic sharing is mandatory, limited to three predefined local edit/test workflows and actual recorded test-command exit status. No task prompts, code, paths, user/project identifiers or raw errors are submitted. Unsupported workflows stay local. Anonymous aggregate reports cannot establish task correctness.\nWorkflow retrieval does not change provider model weights. No benchmark improvement is claimed.\nLive signed-in providers and real Studio/Blender were not tested. Windows binaries are unsigned.\nMicrosoft Defender runner result before cross-platform assembly:\n{defender}\nThe scanned package checksum and scan availability are recorded in release-validation-{VERSION}.\n'''
    notice=f'''PlazCode is GPL-3.0-or-later. Editable source and build instructions:\nhttps://github.com/stoveez/PlazCode/releases/tag/v{VERSION}\nDownload PlazCode-source-{VERSION}.zip.\nVerify GitHub build provenance using gh attestation verify <archive> --repo stoveez/PlazCode.\nGitHub provenance is separate from Windows Authenticode and Apple notarization.\n'''.encode()
    common={'PlazCode/release-notes.json':(a.encode(notes) if hasattr(a,'encode') else (json.dumps(notes,indent=2,ensure_ascii=False)+'\n').encode(),0o100644<<16),'PlazCode/VALIDATION.txt':(validation.encode(),0o100644<<16),'PlazCode/SOURCE.txt':(notice,0o100644<<16),'PlazCode/PlazCode-Extension/SOURCE.txt':(notice,0o100644<<16)}
    firefox['SOURCE.txt']=(notice,0o100644<<16)
    for files in [windows,mac]:
        for name in list(files):
            if name.startswith('PlazCode/PlazCode-Extension-Firefox/') or name=='PlazCode/DEVELOPMENT.txt':del files[name]
        for name,value in firefox.items():
            relative=name.split('/',1)[1] if name.startswith('PlazCode-Extension-Firefox/') else name
            files['PlazCode/PlazCode-Extension-Firefox/'+relative]=value
        files.update(common)
    for name,value in mac.items():
        if name.startswith('PlazCode/PlazCode.app/') or name.endswith('.command'):windows[name]=value
    source.update(common);source['PlazCode/README.md']=(f"PlazCode {VERSION} — {entry['title']}\n\n{entry['summary']}\n".encode(),0o100644<<16)
    a.validate(windows,'windows');a.validate(mac,'macos')
    for files in [windows,mac]:
        for name,value in files.items():
            if name.endswith('.command'):assert value[1]>>16&0o111,name
    for name in source:assert not name.endswith('.exe') and '/target/' not in name and '/node_modules/' not in name,name
    packages=[(f'PlazCode-{VERSION}.zip','windows',windows),(f'PlazCode-macOS-{VERSION}.zip','macos',mac),(f'PlazCode-source-{VERSION}.zip','source',source),(f'PlazCode-Firefox-{VERSION}.zip','firefox',firefox)]
    metadata=[]
    for name,platform,files in packages:
        a.pack(ROOT/name,files);raw=(ROOT/name).read_bytes();metadata.append({'file':name,'platform':platform,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
    a.write_json(ROOT/'release-metadata.json',metadata);byplatform={m['platform']:m for m in metadata}
    import sys
    sys.path.insert(0,str(ROOT));from release_feed import compact_feed
    for path,platform in [('latest.json','windows'),('latest-macos.json','macos')]:
        feed=a.load(ROOT/path);feed.update(version=VERSION,desktop_version=VERSION,url='https://raw.githubusercontent.com/stoveez/PlazCode/main/'+byplatform[platform]['file'],sha256=byplatform[platform]['sha256'])
        if platform=='windows':feed['platforms']['macos'].update(url='https://raw.githubusercontent.com/stoveez/PlazCode/main/'+byplatform['macos']['file'],sha256=byplatform['macos']['sha256'])
        a.write_json(ROOT/path,compact_feed(feed,notes))
    import publish_release
    _,body=publish_release.notes(a.load(ROOT/'latest.json'));(ROOT/f'release-description-{VERSION}.txt').write_text(body)
    header=f"PlazCode {VERSION} — {entry['title']}\n\n{entry['summary']}\n\n"+'\n'.join('- '+s for key in ['added','improved','fixed'] for s in entry[key])+'\n\n'
    (ROOT/'README.md').write_text(header+(ROOT/'README.md').read_text())
    evidence=ROOT/f'release-validation-{VERSION}';evidence.mkdir(exist_ok=True)
    for name in ['run.json','jobs.json']:shutil.copy2(ROOT/'ci-artifacts'/name,evidence/name)
    for name in ['defender-result.txt','defender-package-sha256.txt','defender-engine.json','defender-executable-sha256.txt','windows-signature.txt']:
        matches=list((ROOT/'ci-artifacts/plazcode-1.24-Windows-validation').rglob(name))
        if matches:shutil.copy2(matches[0],evidence/name)
    (evidence/'VALIDATION.txt').write_text(validation)
    p=ROOT/'development/1.24.0/REVIEW.md';p.write_text(p.read_text().replace('Validation: pending exact-source platform CI.','Validation: all exact-source platform CI jobs passed. See release-validation-1.24.0.'))
    print(json.dumps(metadata,indent=2))
if __name__=='__main__':main()
