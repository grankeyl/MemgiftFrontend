export const useTelemetree = () => {
    if (!window.telemetreeBuilder && window.telemetree) {
        window.telemetreeBuilder = window.telemetree({
            projectId: import.meta.env.VITE_TELEMETREE_PROJECT_ID,
            apiKey: import.meta.env.VITE_TELEMETREE_API_KEY,
            appName: "memgifts",
            isTelegramContext: false,
            logLevel: 'info',
            trackGroup: "low"
        });
    }
    return window.telemetreeBuilder;
};