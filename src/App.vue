<template>
  <Transition name="loader-fade">
    <SplashLoader v-if="miniAppLoading && !$route.meta.public" @ready="onAssetsReady" />
  </Transition>

  <RouterView v-slot="{ Component, route }">
    <template v-if="route.meta.public || (!miniAppLoading && miniAppTesting === 'development') || (!miniAppLoading && miniAppMounted)">
      <div v-if="!route.meta.noLayout" class="_main">
        <component
          :is="Component"
          @loaded="onRouterViewLoaded"
          :success="pageSuccess"
          :class="menuPageEnterClass(route.path)"
        />
        <Toast />
      </div>

      <component v-else :is="Component" />

      <Transition name="menu-slide" appear>
        <Menu
          v-if="!route.meta.noLayout"
          @loaded="onMenuLoaded"
        />
      </Transition>
    </template>
  </RouterView>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCacheStore } from './stores/pinia/piniaStore';
import { getUserLanguage, cleanString } from './utils/useApp';
import { Icon } from './components/Icon';
import { hasAPIs, pickInitData, waitForTelegramWebApp } from './hooks/useTelegramReady';
import { cutNumber } from './utils/useTon';
import { nextTick } from 'vue';
// import { setupEruda } from './utils/eruda';

import axios from "axios";
import * as authApi from "./api/authApi";
import * as giftsApi from "./api/giftsApi";
import * as nftsApi from "./api/nftApi";
import * as telegramApi from "./api/telegramApi";
import * as multicheckApi from "./api/multicheckApi";
import * as taskApi from "./api/taskApi";
import * as historyApi from "./api/historyApi";

import * as MarketBalanceApi from "./api/market/balance";

import TelegramModule from './hooks/useTelegram';
import Menu from './components/Menu/Menu.vue';
import Toast from './components/Toast/Toast.vue';
import SplashLoader from './components/SplashLoader.vue';
import i18next from 'i18next';
import { startVersionWatch } from './utils/useAppVersion';
import {
  shouldAnimateMenuPageEnter,
  markMenuPageVisited,
  updateMenuEnterDirection,
  menuEnterDirection,
} from './composables/useMenuPageEnter';

export default {
  components: {
    Menu,
    Toast,
    SplashLoader,
  },

  setup() {
    const miniAppTesting = import.meta.env.VITE_APP_TEST as any;
    const route = useRoute();
    const router = useRouter();
    const miniAppLang = getUserLanguage();
    const miniAppMounted = ref(false);
    const miniAppLoading = ref(true);
    // сплэш уходит, только когда сошлись оба условия: данные получены
    // и ресурсы (шрифты, картинки) реально загружены
    const assetsReady = ref(false);
    const dataReady = ref(false);

    const pageSuccess = ref(false);
    const storeCache = useCacheStore() as any;

    function runSafeEffects() {
      if (route.meta.noLayout) return
    }

    onMounted(runSafeEffects)
    watch(() => route.fullPath, runSafeEffects)

    function scrollTopSmooth() {
      const scroller = document.getElementById('scroller') as HTMLElement | null;
      const target: any = scroller ?? document.scrollingElement ?? document.documentElement;

      try {
        target.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        target.scrollTop = 0;
      }
    }

    let removeHook: (() => void) | undefined;

    function menuPageEnterClass(path: string) {
      if (!shouldAnimateMenuPageEnter(path)) return undefined;
      const dir = menuEnterDirection.value;
      return {
        '_menu-page-enter': true,
        '_menu-page-enter--forward': dir === 'forward',
        '_menu-page-enter--back': dir === 'back',
        '_menu-page-enter--neutral': dir === 'neutral',
      };
    }

    onMounted(() => {

      startVersionWatch();
      router.beforeEach((to, from) => {
        updateMenuEnterDirection(from.path, to.path);
      });
      removeHook = router.afterEach(async (to) => {
        markMenuPageVisited(to.path);
        await nextTick();
        requestAnimationFrame(scrollTopSmooth);
      });
      requestAnimationFrame(scrollTopSmooth);
    });

    onBeforeUnmount(() => {
      removeHook?.();
    });

    onMounted(async () => {
      if (miniAppLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        document.body.classList.add('rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', miniAppLang);
      }

      const webApp = await waitForTelegramWebApp();
      const initDataRaw =
        (webApp && import.meta.env.VITE_APP_MODE === 'production')
          ? pickInitData(webApp)
          : pickInitData(webApp);

      if (webApp && hasAPIs(webApp)) {
        try {
          webApp.ready?.();
          webApp.expand?.();

          const v = Number((webApp as any).version || 0);
          const platform = (webApp as any).platform || 'unknown';
          const isMobile = platform === 'ios' || platform === 'android';

          if (v >= 8 && isMobile && typeof (webApp as any).requestFullscreen === 'function') {
            (webApp as any).requestFullscreen();
          }

          webApp.setBackgroundColor?.('#1C1C1C');
          webApp.setHeaderColor?.('#1C1C1C');

          const applySafeArea = () => {
            const sa = (webApp as any).safeAreaInset;
            const csa = (webApp as any).contentSafeAreaInset;
            const root = document.documentElement;
            if (sa) {
              root.style.setProperty('--tg-safe-area-inset-top', sa.top + 'px');
              root.style.setProperty('--tg-safe-area-inset-bottom', sa.bottom + 'px');
              root.style.setProperty('--tg-safe-area-inset-left', sa.left + 'px');
              root.style.setProperty('--tg-safe-area-inset-right', sa.right + 'px');
            }
            if (csa) {
              root.style.setProperty('--tg-content-safe-area-inset-top', csa.top + 'px');
              root.style.setProperty('--tg-content-safe-area-inset-bottom', csa.bottom + 'px');
              root.style.setProperty('--tg-content-safe-area-inset-left', csa.left + 'px');
              root.style.setProperty('--tg-content-safe-area-inset-right', csa.right + 'px');
            }
          };
          applySafeArea();
          webApp.onEvent?.('safeAreaChanged', applySafeArea);
          webApp.onEvent?.('contentSafeAreaChanged', applySafeArea);

          console.debug('[TG] OK', { platform, v, hasInit: !!pickInitData(webApp) });
        } catch (e) {
          console.error('Init WebApp error:', e);
        }
      } else if (import.meta.env.VITE_APP_ENV !== 'development') {
        location.reload();
      }

      // --- Проверяем тех. работы ---
      try {
        const maintResp = await axios.get(`${import.meta.env.VITE_APP_API_URL}/maintenance`);
        if (maintResp.data?.maintenance === true) {
          miniAppLoading.value = false;
          miniAppMounted.value = true;
          router.replace('/maintenance');
          return;
        }
      } catch {}

      // --- Аутентификация и запуск ---
      const authenticateWith = async (raw: string) => {
        const data = await authApi.init(raw);
        return data ? ([true, data.user] as const) : ([false, null] as const);
      };

      try {
        const isAuthenticated = await authenticateWith(initDataRaw) as any;
        if (isAuthenticated && isAuthenticated[0]) {
          const nftsApp = await giftsApi.getAll();

          if (nftsApp) {
            const initData = TelegramModule.initData();
            const hasRealInitData = initData && initData.user && initData.user.id;
            
            if (hasRealInitData) {
              storeCache.TelegramData = { ...initData };
            } else if (import.meta.env.VITE_APP_INIT_DATA) {
              storeCache.TelegramData = { ...TelegramModule.parseQueryToJSON(import.meta.env.VITE_APP_INIT_DATA) };
            }

            if (storeCache.TelegramData) {
              storeCache.TelegramData.user.firstName = cleanString(storeCache.TelegramData.user.first_name);
              storeCache.TelegramData.user.lastName = cleanString(storeCache.TelegramData.user.last_name);
              storeCache.TelegramData.user.language = miniAppLang;
            }
            
            storeCache.NftsApp = nftsApp.items;
            storeCache.NftsAppData = nftsApp.items;

            storeCache.UserData = { ...isAuthenticated[1] };
            if (storeCache.UserData.user.Language) {
              const lang = storeCache.UserData.user.Language;
              i18next.changeLanguage(lang);
            }

            try {
              const tasksGet = await taskApi.getAll();
              const historyGet = await historyApi.getAll();
              const balance = await MarketBalanceApi.get(storeCache.UserData.user.ID);
              if (balance && balance.balance_ton != null) {
                storeCache.UserData.user.Balance = balance;
                storeCache.UserData.user.Balance.balance_ton = cutNumber(String(balance.balance_ton));
              }

              storeCache.UserData.user_full_name = cleanString(storeCache.UserData.user_full_name);
              storeCache.TasksApp = tasksGet;
              storeCache.HistoryApp = historyGet;
            } catch (loadErr) {
              console.error('Post-auth data load error:', loadErr);
            }

            // Await deep-link handling; always ends with mountMiniApp()
            await initStartApp(TelegramModule.initData()?.start_param);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        // Never leave the user stuck on the splash loader
        // if (!miniAppMounted.value) {
        //   mountMiniApp();
        // }
      }
    });

    const miniAppTransport = (dtx: any) => {
      if (dtx && dtx !== 'debug') {
        if (dtx.startsWith('cln_')) { 
          const collectionKey = dtx.split('cln_')[1];

          if (storeCache.NftsAppData[collectionKey]) {
            router.push(`/collection/${collectionKey}`);
          }
        }
        if (dtx.startsWith('gift_')) {
          const giftId = dtx.split('gift_')[1];
          router.push(`/gift/${giftId}`);
        }
        if (dtx.startsWith('u_')) {
          const userId = dtx.split('u_')[1];
          router.push(`/view/${userId}`);
        }
        if (dtx === 'profile') { router.push('/profile'); }
        if (dtx === 'tickets') { router.push('/tickets'); }
        if (dtx === 'market') { router.push('/m'); }
        if (dtx === 'referrals') { router.push('/referrals'); }
        if (dtx === 'soda') { router.push('/soda'); }
        if (dtx.startsWith('deal_')) {
          const dealId = dtx.split('deal_')[1];
          router.push(`/private-deal/${dealId}`);
        }

        mountMiniApp();
      }
    }

    const initStartApp = async (startParam?: string) => {
      if (!startParam) {
        mountMiniApp();
        return;
      }

      const [startApp, startAppType = ''] = (startParam ?? '').split('_');

      switch (startAppType) {
        case 'check':
          await initStartAppCheck(startApp);
          break;
        case 'multicheck':
          await initStartAppMulticheck(startApp);
          break;
        default:
          miniAppTransport(startParam);
      }
    };

    const isMe = async (userId: string) => {
      const meId = storeCache.TelegramData?.user?.id;
      return Number(userId) === Number(meId);
    };

    const initStartAppCheck = async (startApp: any) => {
      const getNft = await nftsApi.getUuid(startApp);
      const checkMe = await isMe(getNft.user_id);

      if (checkMe) {
        if (getNft.status === 'received') { openReceive(getNft.nft_unique_key, 'notfound', 'check'); }
        if (getNft.status === 'sended') { openReceive(getNft.nft_unique_key, 'selfed', 'check'); }
      }

      if (!checkMe) {
        if (getNft.status === 'received') { openReceive(getNft.nft_unique_key, 'notfound', 'check'); }
        if (getNft.status === 'sended') { setOwnerNft(getNft, 'check'); }
      }
    }

    const initStartAppMulticheck = async (startApp: any) => {
      const getMulticheck = await multicheckApi.getUuid(startApp);
      if (!getMulticheck) {
        mountMiniApp();
        return;
      }

      const saveSummary = () => {
        if (getMulticheck.gifts_summary && getMulticheck.gifts_summary.length) {
          storeCache.LastMulticheckSummary = getMulticheck.gifts_summary.map((g: any) => ({
            name: g.name, image: g.image, count: g.count,
          }));
        }
      };

      if (getMulticheck.status === 'active') {
        if (Number(getMulticheck.user_tld) === Number(storeCache.TelegramData.user.id)) {
          saveSummary();
          openReceive(getMulticheck.nftUniqueKey, 'selfed', 'multicheck');
          return;
        }

        const result = await multicheckApi.activate(getMulticheck.uuid);
        if (!result) {
          openReceive(getMulticheck.nftUniqueKey, 'notfound', 'multicheck');
          return;
        }

        saveSummary();
        mountMiniApp();
        openReceive(getMulticheck.nftUniqueKey, 'received', 'multicheck');
      } else if (getMulticheck.status === 'claimed') {
        openReceive(getMulticheck.nftUniqueKey, 'notfound', 'multicheck');
      } else {
        openReceive(getMulticheck.nftUniqueKey, 'notfound', 'multicheck');
      }
    }

    const hideLoaderWhenReady = () => {
      if (assetsReady.value && dataReady.value) {
        miniAppLoading.value = false;
      }
    };

    const onAssetsReady = () => {
      assetsReady.value = true;
      hideLoaderWhenReady();
    };

    // Раньше здесь стоял искусственный минимум в 2800мс и ожидание только
    // document.fonts.ready. Теперь ждём фактическую загрузку ресурсов —
    // об этом сообщает сам SplashLoader.
    const mountMiniApp = () => {
      miniAppMounted.value = true;
      pageSuccess.value = true;
      dataReady.value = true;
      hideLoaderWhenReady();
    }

    const setOwnerNft = async (getNft: any, checkType: string = 'check') => {
      const updateNft = await nftsApi.updateUuidToStatus(
        getNft.uuid,
        storeCache.TelegramData.user.id,
        'received'
      );
      
      if (!updateNft) {
        openReceive(getNft.nft_unique_key, 'notfound', checkType);
        return;
      }

      await telegramApi.updateShareMessage(getNft.uuid, checkType);

      mountMiniApp();
      
      openReceive(getNft.nft_unique_key, 'received', checkType);
    }

    
    
    const openReceive = async (nft: any, nftType: string, checkType: string = 'check') => {
      let name = 'receive';

      if (checkType === 'check') { name = 'receive' }
      if (checkType === 'multicheck') { name = 'activate-multicheck' }

      mountMiniApp();

      router.push({
        name: name,
        params: {
          nft: nft,
          nftType: nftType
        }
      });
    }

    

    return {
      miniAppLang,
      miniAppTesting,
      miniAppMounted,

      storeCache,
      pageSuccess,

      Icon,
      miniAppLoading,
      onAssetsReady,
      menuPageEnterClass,
    };
  },

  data() {
    return {
      MenuLoaded: false,
      RouterViewLoaded: false,
    };
  },

  methods: {
    onMenuLoaded() {
      this.MenuLoaded = true;
    },

    onRouterViewLoaded() {
      this.RouterViewLoaded = true;
    },
  },
};
</script>

<style lang="sass">
@use "./assets/styles/_variables.sass"
@use "./assets/styles/_root.sass"
@use "./assets/styles/_base.sass"
@use "./assets/styles/_filter-modals.sass"
</style>