<template>
  <div class="_pageLoad" id="pageLoad" v-if="miniAppLoading">
    <div class="background">
      <img src="/bg-load.jpg" alt="background" />
    </div>
    <div class="centered">
      <div class="logotype">
        <img src="/logotype.svg" alt="logotype" />
      </div>
      <div class="kit-icon" v-html="Icon.Load"></div>
    </div>
  </div>

  <RouterView v-slot="{ Component, route }">
    <template v-if="(!miniAppLoading && miniAppTesting === 'development') || (!miniAppLoading && miniAppMounted)">
      <div v-if="!route.meta.noLayout" class="_main">
        <component :is="Component" @loaded="onRouterViewLoaded" :success="pageSuccess" />
        <Toast />
      </div>

      <component v-else :is="Component" />

      <Menu
        v-if="!route.meta.noLayout"
        @loaded="onMenuLoaded"
      />
    </template>
  </RouterView>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCacheStore } from './stores/pinia/piniaStore';
import { getUserLanguage, cleanString } from './utils/useApp';
import { Icon } from './components/Icon';
import { getConfig } from './config';
import { waitForTelegramWebApp } from './hooks/useTelegramReady';
import { cutNumber } from './utils/useTon';
import { nextTick } from 'vue';
import { setupEruda } from './utils/eruda';

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
import Lottie from './components/Lottie.vue';
import Toast from './components/Toast/Toast.vue';
import i18next from 'i18next';

export default {
  components: {
    Menu,
    Lottie,
    Toast,
  },

  setup() {
    const miniAppTesting = import.meta.env.VITE_APP_TEST as any;
    const route = useRoute();
    const router = useRouter();
    const miniAppLang = getUserLanguage();
    const miniAppMounted = ref(false);
    const miniAppLoading = ref(true);

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

    onMounted(() => {
      removeHook = router.afterEach(async () => {
        await nextTick();
        requestAnimationFrame(scrollTopSmooth);
      });
      requestAnimationFrame(scrollTopSmooth);
    });

    onBeforeUnmount(() => {
      removeHook?.();
    });

    onMounted(async () => {
      const webApp = await waitForTelegramWebApp();

      if (webApp) {
        try {
          setupEruda(webApp.initDataUnsafe.user.id);

          webApp.ready?.();

          console.log("READY:" + webApp);

          webApp.expand?.();

          console.log("EXPAND:" + webApp);

          const v = Number((webApp as any).version || 0);
          const platform = (webApp as any).platform || 'unknown';
          const isMobile = platform === 'ios' || platform === 'android';

          if (v >= 8 && isMobile && webApp.requestFullscreen) {
            webApp.requestFullscreen();
          }

          webApp.setBackgroundColor?.('#1C1C1C');
          webApp.setHeaderColor?.('#1C1C1C');

        } catch (e) { console.error('Init WebApp error:', e); }
      } else {
        console.warn('Telegram WebApp недоступен: работаем без интеграции');
      }

      const resolvedInitData =
        (webApp?.initData && miniAppTesting === 'production')
          ? webApp.initData
          : (window?.Telegram?.WebApp?.initData || import.meta.env.VITE_APP_INIT_DATA);

      const authenticateWith = async (initDataRaw: string) => {
        const data = await authApi.init(initDataRaw);
        if (data) { pageSuccess.value = true; return [true, data.user] as const; }
        return [false, null] as const;
      };

      try {
        const isAuthenticated = await authenticateWith(resolvedInitData) as any;
        if (!isAuthenticated?.[0]) {
          if (!miniAppMounted.value) mountMiniApp();
          return;
        }

        if (isAuthenticated && isAuthenticated[0]) {
          const nftsApp = await giftsApi.getAll();

          if (nftsApp) {
            const initData = TelegramModule.initData();
            
            if (miniAppTesting !== 'production') {
              storeCache.TelegramData = { ...TelegramModule.parseQueryToJSON(import.meta.env.VITE_APP_INIT_DATA) };
            } else {
              storeCache.TelegramData = { ...initData };
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
            initStartApp(TelegramModule.initData()?.start_param);

            const tasksGet = await taskApi.getAll();
            const historyGet = await historyApi.getAll();
            const balance = await MarketBalanceApi.get(storeCache.UserData.user.ID);
            if (balance && balance.balance_ton) {
              storeCache.UserData.user.Balance = balance;
              storeCache.UserData.user.Balance.balance_ton = cutNumber(balance.balance_ton);
            }

            storeCache.UserData.user_full_name = cleanString(storeCache.UserData.user_full_name);
            storeCache.TasksApp = tasksGet;
            storeCache.HistoryApp = historyGet;
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!miniAppMounted.value) mountMiniApp();
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
      if (!getMulticheck) return;

      if (getMulticheck.status === 'active') {
        const checkUser = await checkMulticheckUser(storeCache.TelegramData.user.id, getMulticheck.userIds);
        
        if (checkUser) {
          openReceive(getMulticheck.nftUniqueKey, 'selfed', 'multicheck');
          return;
        }

        const userIdsArray = getMulticheck.userIds ? getMulticheck.userIds.split(',') : [];
        const nftsIdsArray = Array.isArray(getMulticheck.nftsIds)
          ? getMulticheck.nftsIds
          : JSON.parse(getMulticheck.nftsIds);
        const nftIdNew = nftsIdsArray.shift();

        setOwnerMulticheckNft(
          nftIdNew, 
          getMulticheck.user_id, 
          'multicheck',
          getMulticheck.uuid,
          userIdsArray.join(','),
          nftsIdsArray
        );
      } else {
        openReceive(getMulticheck.nftUniqueKey, 'notfound', 'multicheck');
      }
    }

    const mountMiniApp = () => {
      if (miniAppLang) {
        miniAppMounted.value = true;
        setTimeout(() => { miniAppLoading.value = false; }, getConfig().skeletonTime);
      } else {
        miniAppMounted.value = true;
        setTimeout(() => { miniAppLoading.value = false; }, getConfig().skeletonTime);
      }
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

    const setOwnerMulticheckNft = async (
      getNft: any, 
      multicheckOwnerId: string, 
      checkType: string = 'check',
      multicheckUuid: string = '',
      multicheckUserIds: string = '',
      multicheckNftsIdsArray: string = ''
    ) => {
      const findNft = await nftsApi.getUuid(getNft);

      if (!findNft) {
        openReceive(getNft, 'notfound', checkType);
        return; 
      }

      if (findNft.user_id !== multicheckOwnerId) {
        openReceive(getNft, 'notfound', checkType);
        return; 
      }

      const updateNft = await nftsApi.updateUuidToStatus(
        getNft,
        storeCache.TelegramData.user.id,
        'received'
      );

      if (!updateNft) {
        openReceive(getNft, 'selfed', checkType);
        return;
      };

      multicheckUserIds += ',' + storeCache.TelegramData.user.id;

      const updateMulticheck = await multicheckApi.update(multicheckUuid, multicheckUserIds, JSON.stringify(multicheckNftsIdsArray));
      if (!updateMulticheck) return;

      await telegramApi.updateShareMessageMulticheck(multicheckOwnerId, updateNft.uuid, checkType);

      openReceive(updateNft.nft_unique_key, 'received', checkType);
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

    const checkMulticheckUser = async (userId: string, userIds: string) => {
      if (!userIds) return false;
      return userIds.split(',').includes(String(userId));
    };

    return {
      miniAppLang,
      miniAppTesting,
      miniAppMounted,

      storeCache,
      pageSuccess,

      Icon,
      miniAppLoading,
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
</style>