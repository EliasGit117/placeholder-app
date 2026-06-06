// Tiny replacement for @tanstack/react-hotkeys' formatForDisplay: turns a
// "Mod+Shift+X" style shortcut into platform-appropriate symbols.
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const KEY_MAP: Record<string, string> = isMac
  ? { mod: '⌘', shift: '⇧', alt: '⌥', ctrl: '⌃' }
  : { mod: 'Ctrl', shift: 'Shift', alt: 'Alt', ctrl: 'Ctrl' };

export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split('+').map((raw) => {
    const key = raw.trim();
    return KEY_MAP[key.toLowerCase()] ?? key.toUpperCase();
  });

  return isMac ? parts.join('') : parts.join('+');
}
