// ── проверка актуальности версии приложения ───────────────────────────
// WebView Telegram держит открытую страницу неделями, поэтому даже после
// выкатки человек продолжает пользоваться старым бандлом. Сравниваем имя
// работающего бандла с тем, что сейчас лежит на сервере, и перезагружаем
// страницу, если версия сменилась.
//
// Имена бандлов хэшированные (index-XXXX.js), так что сравнение имени —
// это и есть сравнение версий, никакого отдельного файла не требуется.

const BUNDLE_RE = /assets\/index-[A-Za-z0-9_-]+\.js/;
const CHECK_INTERVAL_MS = 10 * 60 * 1000;

let currentBundle = '';
let reloading = false;
let timer: ReturnType<typeof setInterval> | null = null;

const readCurrentBundle = (): string => {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
    for (const s of scripts) {
        const hit = s.src.match(BUNDLE_RE);
        if (hit) return hit[0];
    }
    return '';
};

const fetchDeployedBundle = async (): Promise<string> => {
    // cache: no-store обязателен: иначе получим ту же закэшированную
    // страницу, из-за которой и застряли на старой версии
    const res = await fetch(`/index.html?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return '';
    const html = await res.text();
    const hit = html.match(BUNDLE_RE);
    return hit ? hit[0] : '';
};

const check = async () => {
    if (reloading || !currentBundle) return;

    try {
        const deployed = await fetchDeployedBundle();
        if (!deployed || deployed === currentBundle) return;

        reloading = true;
        if (timer) clearInterval(timer);
        // replace, а не reload: не оставляем старую страницу в истории
        window.location.replace(window.location.pathname + window.location.search);
    } catch {
        // сеть недоступна — молча ждём следующей проверки
    }
};

export const startVersionWatch = () => {
    // в разработке бандл не хэшируется и проверка только мешает
    if (!import.meta.env.PROD) return;

    currentBundle = readCurrentBundle();
    if (!currentBundle) return;

    // основной триггер — возврат в приложение: именно тогда человек
    // видит экран заново и перезагрузка незаметна
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
    });

    timer = setInterval(check, CHECK_INTERVAL_MS);
};
