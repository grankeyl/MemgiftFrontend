import { ref } from 'vue';

export const MENU_TAB_PATHS = ['/', '/tickets', '/m', '/profile'] as const;

export type MenuTabPath = (typeof MENU_TAB_PATHS)[number];

const STORAGE_KEY = 'mg:menu-tabs-visited';

function loadVisited(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

const visitedMenuPaths = ref<Set<string>>(loadVisited());

export function menuTabIndex(path: string): number {
  return MENU_TAB_PATHS.indexOf(path as MenuTabPath);
}

export function isMenuTabPath(path: string): path is MenuTabPath {
  return menuTabIndex(path) >= 0;
}

export function shouldAnimateMenuPageEnter(path: string): boolean {
  return isMenuTabPath(path) && !visitedMenuPaths.value.has(path);
}

export function markMenuPageVisited(path: string): void {
  if (!isMenuTabPath(path) || visitedMenuPaths.value.has(path)) return;
  const next = new Set(visitedMenuPaths.value);
  next.add(path);
  visitedMenuPaths.value = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    /* ignore */
  }
}

export const menuEnterDirection = ref<'forward' | 'back' | 'neutral'>('neutral');

export function updateMenuEnterDirection(fromPath: string, toPath: string): void {
  if (!isMenuTabPath(fromPath) || !isMenuTabPath(toPath)) {
    menuEnterDirection.value = 'neutral';
    return;
  }
  const fromIdx = menuTabIndex(fromPath);
  const toIdx = menuTabIndex(toPath);
  if (toIdx > fromIdx) menuEnterDirection.value = 'forward';
  else if (toIdx < fromIdx) menuEnterDirection.value = 'back';
  else menuEnterDirection.value = 'neutral';
}
