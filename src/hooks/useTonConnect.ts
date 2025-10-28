import { TonConnectUI, THEME } from '@tonconnect/ui';

export const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://memgift.codes/s3/tonconnect/tonconnect-manifest.json',
});

tonConnectUI.uiOptions = {
  language: 'en',
  uiPreferences: {
    theme: THEME.DARK,
  },
};