// ----- types
export type TGWebApp = typeof window.Telegram.WebApp | null;

// ----- utils
export function hasAPIs(w: any) {
  return !!w && typeof w.ready === 'function' && typeof w.expand === 'function';
}

export function pickInitData(webApp: any): string {
  // 1) из объекта
  if (webApp && typeof webApp.initData === 'string' && webApp.initData.length > 0) {
    return webApp.initData;
  }
  // 2) из URL (эмуляция Telegram параметрами)
  const url = new URL(window.location.href);
  const fromUrl =
    url.searchParams.get('tgWebAppData') ||
    url.searchParams.get('tgWebAppStartParam') || // на всякий — бывает строка с полезным payload
    '';
  if (fromUrl) return fromUrl;

  // 3) из глобального окна (если кто-то руками положил)
  const winInit = (window as any)?.Telegram?.WebApp?.initData;
  if (typeof winInit === 'string' && winInit.length > 0) return winInit;

  // 4) .env fallback для дев-окружения
  return import.meta.env.VITE_APP_INIT_DATA || '';
}

// ----- main wait
export async function waitForTelegramWebApp(opts?: {
  timeoutMs?: number;
  firstDelayMs?: number;
  maxDelayMs?: number;
}): Promise<TGWebApp> {
  const timeoutMs = opts?.timeoutMs ?? 6000;
  let delay = opts?.firstDelayMs ?? 50;
  const maxDelay = opts?.maxDelayMs ?? 400;

  const started = Date.now();

  // подождём один тик
  await new Promise(r => setTimeout(r, 0));

  // быстрый чек
  if (hasAPIs(window?.Telegram?.WebApp)) return window.Telegram.WebApp;

  // подстрахуемся событием web_app_ready (если Telegram его кинет позже)
  let readyFired = false;
  const onReady = () => (readyFired = true);
  window.addEventListener('web_app_ready', onReady, { once: true });

  try {
    while (Date.now() - started < timeoutMs) {
      const w = window?.Telegram?.WebApp;
      if (hasAPIs(w)) return w;
      if (readyFired && hasAPIs(window?.Telegram?.WebApp)) {
        return window.Telegram.WebApp;
      }
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  } finally {
    window.removeEventListener('web_app_ready', onReady);
  }

  return null;
}