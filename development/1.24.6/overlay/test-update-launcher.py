import json,os,shutil,subprocess,tempfile
from pathlib import Path
if os.name!='nt':
 print('SKIP Windows updater batch launcher');raise SystemExit(0)
with tempfile.TemporaryDirectory(prefix="PlazCode updater ") as temporary:
 root=Path(temporary);shutil.copyfile('Update-PlazCode.bat',root/'Update-PlazCode.bat')
 (root/'Update-PlazCode.ps1').write_text("param([string]$Probe)\n@{policy=(Get-ExecutionPolicy);probe=$Probe}|ConvertTo-Json -Compress|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'probe.json')\nexit 13\n",encoding='utf-8')
 result=subprocess.run(['cmd.exe','/D','/C',str(root/'Update-PlazCode.bat'),'-Probe','verified'],input='\n',text=True,capture_output=True,timeout=20,env={**os.environ,'PSExecutionPolicyPreference':'Restricted'})
 assert result.returncode==13,(result.returncode,result.stdout,result.stderr)
 value=json.loads((root/'probe.json').read_text(encoding='utf-8-sig'));assert value=={'policy':'Bypass','probe':'verified'},value
 print('PASS actual manual updater batch launcher under Restricted policy, argument forwarding and helper exit status.')
