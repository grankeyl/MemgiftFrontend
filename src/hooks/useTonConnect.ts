import { TonConnectUI, THEME } from '@tonconnect/ui';

export const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://memgifts.s3.us-east-1.amazonaws.com/tonconnect-manifest.json',
});

tonConnectUI.uiOptions = {
  language: 'en',
  uiPreferences: {
    theme: THEME.DARK,
  },
};