type TelegramWebApp = NonNullable<typeof window.Telegram>["WebApp"];

export function waitForTelegramWebApp(timeoutMs = 5000): Promise<TelegramWebApp | null> {
  return new Promise((resolve) => {
    const ready = () => {
      const telegram = window.Telegram;
      resolve(telegram?.WebApp ?? null);
    };

    if (window.Telegram?.WebApp) return ready();

    const onReady = () => {
      document.removeEventListener("TelegramWebAppReady", onReady);
      ready();
    };
    document.addEventListener("TelegramWebAppReady", onReady, { once: true });

    setTimeout(() => {
      document.removeEventListener("TelegramWebAppReady", onReady);
      resolve(null);
    }, timeoutMs);
  });
}