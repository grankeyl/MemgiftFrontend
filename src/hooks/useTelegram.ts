import { t } from "i18next";

import WebApp from '@twa-dev/sdk';

const TelegramModule = {
    initMiniApp() {
      WebApp.backgroundColor = '#100B0D';
      WebApp.requestWriteAccess();
      WebApp.disableVerticalSwipes();
      WebApp.ready();
      WebApp.expand();
    },

    readyMiniApp() {
      WebApp.ready();
    },

    initDataRaw() {
      return WebApp.initData;
    },

    initData() {
      return WebApp.initDataUnsafe;
    },

    checkStartParam() {
      return WebApp.initDataUnsafe?.start_param || null;
    },

    hideBackButton() {
      const backButton = WebApp.BackButton;
      if (backButton?.isVisible !== undefined) {
        backButton.hide();
      }
    },

    useBackButton(action: any) {
      const backButton = WebApp.BackButton;
      if (backButton?.show && backButton.onClick) {
        backButton.show();
        backButton.onClick(action);
      }
    },

    useSoftHaptic() {
      WebApp.HapticFeedback?.impactOccurred?.('soft');
    },

    useLightHaptic() {
      WebApp.HapticFeedback?.impactOccurred?.('light');
    },

    useMediumHaptic() {
      WebApp.HapticFeedback?.impactOccurred?.('medium');
    },

    useHeavyHaptic() {
      WebApp.HapticFeedback?.impactOccurred?.('heavy');
    },

    useLink(link: string) {
      WebApp.openTelegramLink(link);
    },

    async useShare(url: string, message: string) {
      const encodedUrl = encodeURIComponent(url);
      const encodedMessage = encodeURIComponent(message);
      const shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
      WebApp.openTelegramLink(shareLink);
    },

    async useShareMessage(id: string): Promise<void> {
      return new Promise((resolve, reject) => {
        WebApp.shareMessage(id, (success) => {
          if (success) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },

    async useInvoice(invoiceUrl: string, actionSuccess: any, actionError: any) {
      try {
        WebApp.openInvoice(invoiceUrl);

        WebApp.onEvent('invoiceClosed', (event) => {
          if (event.status === 'paid') {
            actionSuccess();
          } else {
            actionError();
          }
        });
      } catch (error) {
        actionError();
      }
    },

    async useSetEmoji(custom_emoji_id: string) {
      console.log(custom_emoji_id);
      // const cleanup: VoidFunction[] = [];

      // if (!setEmojiStatus.isSupported() || !setEmojiStatus.isAvailable()) {
      //   return Promise.reject(new Error('Emoji status not supported'));
      // }

      // if (!requestEmojiStatusAccess.isSupported() || !requestEmojiStatusAccess.isAvailable()) {
      //   return Promise.reject(new Error('Access not available'));
      // }

      // return new Promise((res, rej) => {
      //   cleanup.push(
      //     on('emoji_status_failed' as any, rej),
      //     on('emoji_status_set' as any, res),
      //   );
      //   postEvent('web_app_set_emoji_status' as any, { custom_emoji_id });
      // })
      // .catch((err) => {
      //   return Promise.reject(err);
      // })
      // .finally(() => {
      //   cleanup.forEach(c => c());
      // });
    },

    async useShareStory(storyMedia: string) {
      WebApp.shareToStory(storyMedia, {
        text: t('tickets.storyTaskDescription') + ' ' 
        + import.meta.env.VITE_APP_MINI_APP_USERNAME,
        widget_link: {
          url: import.meta.env.VITE_APP_MINI_APP_LINK,
          name: import.meta.env.VITE_APP_MINI_APP_USERNAME,
        },
    });
      
      return true;
    },
};

export default TelegramModule;