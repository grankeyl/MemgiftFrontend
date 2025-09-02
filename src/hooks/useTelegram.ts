// import { hapticFeedback, miniApp, on, postEvent, requestEmojiStatusAccess, setEmojiStatus, shareStory } from '@telegram-apps/sdk';
// import { backButton, invoice, initDataStartParam, openTelegramLink } from '@telegram-apps/sdk';
// import { init, viewport, requestWriteAccess, retrieveLaunchParams } from '@telegram-apps/sdk';
// import { mockTelegramEnv } from '@telegram-apps/sdk';
import { t } from "i18next";

import WebApp from '@twa-dev/sdk';

// function mock(status: string = import.meta.env.VITE_APP_TEST) {
//   if (status === 'development') {
//     mockTelegramEnv({
//       themeParams: {
//         button_color: "#2ea6ff", 
//         button_text_color: "#ffffff", 
//         accent_text_color: "#2ea6ff", 
//         subtitle_text_color: "#b1c3d5", 
//         section_header_text_color: "#b1c3d5"
//       },
//       initData: {
//         user: {
//           id: 2200247226,
//           firstName: 'wwt',
//           lastName: '',
//           languageCode: 'ru',
//           isPremium: true,
//           allowsWriteToPm: true,
//           photoUrl: 'https://a-ttgme.stel.com/i/userpic/320/OERv8lzDgDAie_Vug0fWgGKrGbilJE23xIyDJ0x0FcNpibvL9mFLSOkM7Dszycw_.svg',
//         },
//         hash: '488b3c2ebb52f3d29f9f6478c97c8fbf75c49a06425ac6371f172c358be703d0',
//         authDate: new Date(1738006494000),
//         signature: 'G327NYDx2mn6BzMyWirsvYUUMSPR9DAJUAacYo7AK56irlFGX21LTSttRIb7kAWlieCfhDLFybwEUis-hhZyDQ',
//         chatType: 'sender',
//         chatInstance: '8428209589180549439',
//       },
//       initDataRaw: new URLSearchParams([
//         ['user', JSON.stringify({
//           id: 2200247226,
//           first_name: 'wwt',
//           last_name: '',
//           language_code: 'ru',
//           is_premium: true,
//           allows_write_to_pm: true,
//         })],
//         ['hash', '488b3c2ebb52f3d29f9f6478c97c8fbf75c49a06425ac6371f172c358be703d0'],
//         ['auth_date', '1738006494'],
//         ['signature', 'G327NYDx2mn6BzMyWirsvYUUMSPR9DAJUAacYo7AK56irlFGX21LTSttRIb7kAWlieCfhDLFybwEUis-hhZyDQ'],
//         ['chat_type', 'sender'],
//         ['chat_instance', '8428209589180549439'],
//       ]).toString(),
//       version: '8.0',
//       platform: 'tdesktop',
//     });
//   }
// }

// mock();
// init();

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