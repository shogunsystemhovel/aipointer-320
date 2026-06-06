import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';
import type { LaunchableApp } from '../types';

const execFileP = promisify(execFile);

type AppEntry = {
  id: string;
  label: string;
  mac?: string;          // -a argument for `open`
  win?: string;          // command name for `start`
  linux?: string[];      // argv passed to execFile directly
};

// Curated, hardcoded whitelist. The LLM can never request an app outside
// this set — the JSON-schema for launch_app constrains `app` to the
// enum derived from this table. Adding apps is a code change.
const APPS: AppEntry[] = [
  // Creative — primary candidates for child mode
  { id: 'paint', label: 'Paint',
    mac: 'Preview', win: 'mspaint', linux: ['kolourpaint'] },
  // Utility apps, both modes
  { id: 'calculator', label: 'Calculator',
    mac: 'Calculator', win: 'calc', linux: ['gnome-calculator'] },
  { id: 'notes', label: 'Notes',
    mac: 'Notes', win: 'notepad', linux: ['gedit'] },
  // Office (adult-only by default — parents must add to childModeAllowedApps)
  { id: 'word', label: 'Word',
    mac: 'Microsoft Word', win: 'winword', linux: ['libreoffice', '--writer'] },
  { id: 'excel', label: 'Excel',
    mac: 'Microsoft Excel', win: 'excel', linux: ['libreoffice', '--calc'] },
  // Communication (adult only)
  { id: 'mail', label: 'Mail',
    mac: 'Mail', win: 'outlook', linux: ['thunderbird'] },
  // Browser (adult only — child mode opens URLs via open_url to whitelisted sites)
  { id: 'browser', label: 'Browser',
    mac: 'Safari', win: 'msedge', linux: ['xdg-open', 'about:blank'] },
];

const ID_RE = /^[a-z][a-z0-9_-]{0,30}$/;

export function getAppRegistry(): AppEntry[] {
  return APPS;
}

export function getValidAppIds(): string[] {
  return APPS.map((a) => a.id);
}

export async function listLaunchableApps(): Promise<LaunchableApp[]> {
  const out: LaunchableApp[] = [];
  for (const a of APPS) {
    const available = await isAppAvailable(a);
    out.push({ id: a.id, label: a.label, available });
  }
  return out;
}

async function isAppAvailable(a: AppEntry): Promise<boolean> {
  if (process.platform === 'darwin') {
    if (!a.mac) return false;
    // mdfind would be more reliable but is slow; do a quick "does it
    // exist as an app in /Applications" check. Falls back to "best
    // effort true" for built-in apps we know ship with macOS.
    const builtIn = new Set(['Calculator', 'Notes', 'Mail', 'Preview', 'Safari']);
    if (builtIn.has(a.mac)) return true;
    return (
      existsSync(`/Applications/${a.mac}.app`) ||
      existsSync(`/System/Applications/${a.mac}.app`)
    );
  }
  if (process.platform === 'win32') {
    if (!a.win) return false;
    // Best-effort: assume mspaint/calc/notepad/outlook/excel/word exist
    // on standard installs. A real check would require WMI; we trust the
    // user when they ask for the app.
    return true;
  }
  if (process.platform === 'linux') {
    if (!a.linux || a.linux.length === 0) return false;
    // Check whether the first executable resolves on PATH.
    try {
      await execFileP('which', [a.linux[0]]);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function launchApp(
  appId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof appId !== 'string' || !ID_RE.test(appId)) {
    return { ok: false, error: 'Invalid app id.' };
  }
  const entry = APPS.find((a) => a.id === appId);
  if (!entry) {
    return { ok: false, error: `Unknown app "${appId}".` };
  }
  try {
    if (process.platform === 'darwin') {
      if (!entry.mac) return { ok: false, error: 'Not available on macOS.' };
      await execFileP('open', ['-a', entry.mac]);
      return { ok: true };
    }
    if (process.platform === 'win32') {
      if (!entry.win) return { ok: false, error: 'Not available on Windows.' };
      // Using `cmd /c start "" <name>` so the start command parses the
      // window-title slot correctly. We pass entry.win as a separate arg
      // so it goes through Node's argv quoting, not the shell.
      await execFileP('cmd', ['/c', 'start', '""', entry.win]);
      return { ok: true };
    }
    if (process.platform === 'linux') {
      if (!entry.linux || entry.linux.length === 0) {
        return { ok: false, error: 'Not available on Linux.' };
      }
      await execFileP(entry.linux[0], entry.linux.slice(1));
      return { ok: true };
    }
    return { ok: false, error: 'Unsupported platform.' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
