import { useEffect } from 'react';

const NAV_SHORTCUTS: Record<string, string> = {
  'g+d': 'dashboard',
  'g+t': 'tasks',
  'g+s': 'study',
  'g+g': 'games',
  'g+a': 'achievements',
  'g+f': 'social',
  'g+p': 'profile',
  'g+1': 'ai',
};

export function useKeyboardShortcuts(setActiveTab: (tab: string) => void) {
  useEffect(() => {
    let gPress = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        gPress = Date.now();
        setTimeout(() => { gPress = 0; }, 1000);
        return;
      }
      const key = e.key.toLowerCase();
      if (gPress && Date.now() - gPress < 1000) {
        const combo = `g+${key}`;
        if (NAV_SHORTCUTS[combo]) {
          e.preventDefault();
          setActiveTab(NAV_SHORTCUTS[combo]);
          gPress = 0;
          return;
        }
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const shortcuts = Object.entries(NAV_SHORTCUTS)
          .map(([k, v]) => `${k} -> ${v.charAt(0).toUpperCase() + v.slice(1)}`).join('\n');
        alert(`Keyboard Shortcuts:\n\n${shortcuts}\n\nPress g then a key to navigate. Press ? for help.`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveTab]);
}
