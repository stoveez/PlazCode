"""Check the packaged macOS desktop's lifetime and real updater relaunch function."""
from pathlib import Path
import json, os, signal, subprocess, tempfile, time

install = Path(os.environ['PLAZCODE_MAC_TEST_INSTALL']).resolve()
binary = install / 'PlazCode.app/Contents/MacOS/PlazCode'
version = json.loads((install / 'PlazCode-Extension/manifest.json').read_text())['version']
helper = (install / 'Update-PlazCode.command').read_text()
function = helper[helper.index('relaunch_updated(){'):helper.index('\n[[ "$expectedhash"')]
results = []

def alive(pid):
    result = subprocess.run(['/bin/ps', '-ww', '-p', str(pid), '-o', 'comm='], capture_output=True, text=True)
    return result.stdout.strip() == str(binary)

def stop(pid):
    if not pid or not alive(pid):
        return
    os.kill(pid, signal.SIGTERM)
    for _ in range(100):
        if not alive(pid):
            return
        time.sleep(.1)
    if alive(pid):
        os.kill(pid, signal.SIGKILL)

with tempfile.TemporaryDirectory(prefix='plazcode-macos-desktop-') as temporary:
    stage = Path(temporary)
    config = stage / 'config'
    config.mkdir()
    env = {**os.environ, 'LOCALAPPDATA': str(config), 'XDG_CONFIG_HOME': str(config),
           'PLAZCODE_WORKSPACE_ROOT': str(stage / 'workspace')}
    for mode in ['foreground', 'background', 'restore']:
        ready = stage / 'desktop-ready.json'
        ready.unlink(missing_ok=True)
        script = stage / 'relaunch.command'
        script.write_text('set -euo pipefail\nroot=$1; stage=$2; version=$3; mode=$4\n'
                          'restore_args=(); if [[ "$mode" == restore ]]; then restore_args=(--restore-window); mode=background; fi\n'
                          + function + '\nrelaunch_updated\n')
        pid = None
        try:
            result = subprocess.run(['/bin/bash', str(script), str(install), str(stage), version, mode],
                                    env=env, capture_output=True, text=True, timeout=65)
            if ready.exists():
                pid = json.loads(ready.read_text())['pid']
            assert result.returncode == 0, (mode, result.stdout, result.stderr)
            record = json.loads(ready.read_text())
            assert record['desktop_ready'] and record['version'] == version and alive(pid), record
            # Cross the three-minute automatic-update idle interval in the visible desktop.
            duration = 210 if mode == 'foreground' else 15
            deadline = time.monotonic() + duration
            while time.monotonic() < deadline:
                assert alive(pid), f'{mode} desktop exited without an explicit quit; inspect agent.log'
                time.sleep(.2)
            results.append({'mode': mode, 'version': version, 'alive_seconds': duration, 'desktop_ready': True})
            print('PASS macOS desktop readiness, updater relaunch and process lifetime:', results[-1], flush=True)
        finally:
            stop(pid)

Path('mac-desktop-result.json').write_text(json.dumps(results, indent=2) + '\n')
