// Надёжный ожидатель Telegram WebApp с валидацией "не пустой" объект
export type TGWebApp = typeof window.Telegram.WebApp | null;

function isValidWebApp(w: any): w is TGWebApp {
  if (!w) return false;
  // ключевые признаки: есть методы + хоть какие-то init-данные
  const hasAPIs =
    typeof w.ready === 'function' &&
    typeof w.expand === 'function' &&
    (typeof w.setBackgroundColor === 'function' || typeof w.setHeaderColor === 'function');

  const hasInit =
    (typeof w.initData === 'string' && w.initData.length > 0) ||
    (w.initDataUnsafe && w.initDataUnsafe.user && typeof w.initDataUnsafe.user.id === 'number');

  return hasAPIs && !!hasInit;
}

export async function waitForTelegramWebApp(opts?: {
  timeoutMs?: number;          // общий таймаут
  firstDelayMs?: number;       // начальная задержка
  maxDelayMs?: number;         // максимум между попытками
}): Promise<TGWebApp> {
  const timeoutMs = opts?.timeoutMs ?? 6000;
  let delay = opts?.firstDelayMs ?? 50;
  const maxDelay = opts?.maxDelayMs ?? 400;

  const started = Date.now();

  // иногда Telegram внедряет объект уже после DOMContentLoaded
  // подождём хотя бы один тик макрозадачи
  await new Promise(r => setTimeout(r, 0));

  // одна мгновенная проверка
  if (isValidWebApp(window?.Telegram?.WebApp)) return window.Telegram.WebApp;

  while (Date.now() - started < timeoutMs) {
    const w = window?.Telegram?.WebApp;
    if (isValidWebApp(w)) return w;

    // если объект есть, но "пустой", подождём ещё
    await new Promise(r => setTimeout(r, delay));
    delay = Math.min(delay * 2, maxDelay);
  }

  // финальная попытка: иногда initData появляется чуть позже методов
  const last = window?.Telegram?.WebApp ?? null;
  return isValidWebApp(last) ? last : null;
}