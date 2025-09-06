declare global {
  interface Window {
      Telegram?: {
        WebApp: {
          ready: () => void;
          expand: () => void;
          close: () => void;
          enableClosingConfirmation: () => void;
          setHeaderColor: (color: string) => void;
          setBottomBarColor: (color: string) => void;
          setBackgroundColor: (color: string) => void;
          requestFullscreen: () => void;
          HapticFeedback: {
            impactOccurred: (style: string) => void;
            notificationOccurred: (type: string) => void;
            selectionChanged: () => void;
          };
          ThemeParams: { bg_color: string };
          initData: string;
          initDataUnsafe: {
            start_param: string | null;
            user: {
              id: number;
              first_name: string;
              last_name: string;
              username: string;
              language_code: string;
              is_premium: boolean;
              added_to_attachment_menu: boolean;
              allows_write_to_pm: boolean;
              photo_url: string | null;
              start_param: string | null;
            };
          };
          // в SDK этих событий пока нет в типах
          onEvent: (name: string, cb: (...args: any[]) => void) => void;
          offEvent: (name: string, cb: (...args: any[]) => void) => void;

          // опционально — может отсутствовать
          shareMessage?: (text: string, callback: (success: boolean) => void) => void;

          BackButton: {
            onClick: (callback: () => void) => void;
            offClick: (callback: () => void) => void;
            show: () => void;
            hide: () => void;
          };
          MainButton: {
            isVisible: boolean;
            text: string;
            setText: (text: string) => void;
            textColor: string;
            color: string;
            setParams: (params: object) => void;
            onClick: (callback: () => void) => void;
            offClick: (callback: () => void) => void;
            enable: () => void;
            show: () => void;
            hide: () => void;
          };
          openTelegramLink: (link: string) => void;
          showConfirm: (message: string) => Promise<boolean>;
        };
        WebView?: { postEvent?: (event: string, data?: unknown) => void };
      };
    }
  }
  
  export {};