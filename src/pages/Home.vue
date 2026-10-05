<template>
  <section class="_wrap _home" :class="{ desktop: isDesktop() }">
    <div class="bluring-t"></div>
    <div class="bluring-b"></div>
    <div class="_view">
      <div class="title">
        <img src="/logotype.svg" alt="logotype" />
        <div class="title-right flex items-center gap-2">
          <div class="balance" @click="openWallet">
            <Icon class="kit-icon" v-html="Icon.Gram" />
            <span>{{ cutNumber(getBalance.toString()) }}</span>
          </div>
        </div>
      </div>

      <Slider
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :slides="SlidesList" 
      />

      <Gifts
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
      />
    </div>
  </section>
</template>

<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { toRaw } from 'vue';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';
import { getConfig } from '../config';
import { getImageUrl, unixToRelative } from '../utils/useApp';
import { pluralizeGift } from '../utils/useGift';
import { cutNumber } from '../utils/useTon';

import * as historyApi from '../api/historyApi';

import Title from '../components/Root/Title.vue';
import Slider from '../components/Home/Slider.vue';
import Funcs from '../components/Home/Funcs.vue';
import Gifts from '../components/Home/Gifts.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Title,
    Slider,
    Funcs,
    Gifts,
  },

  computed: {
    getFirstHistory() {
      return this.storeCache.HistoryApp[0];
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  data() {
    return {
      pageApp: 'Home',
      configApp: getConfig(),
      storeCache: useCacheStore() as any,
      
      handleLoads: 0,
      propsSuccess: this.$props.success,
      isPageLoading: true,

      SlidesList: [
        {
          id: 2,
          ImageContent: "",
          BgImage: "/home/slider-1.png?v=2",
          Link: "https://t.me/memgift/768",
        },
        {
          id: 1,
          ImageContent: "",
          BgImage: "/home/slider-2.png?v=2",
          Link: "https://t.me/memgift/468",
        },
      ],

      Icon,
      isDesktop,
      getImageUrl,
      unixToRelative,
      pluralizeGift,
      cutNumber,
    };
  },

  mounted() {
    TelegramModule.hideBackButton();
    this.initHistory();
  },

  methods: {
    openWallet() { this.$router.push('/wallet'); },
    checkPageApp() {
      const pageAppCheck = this.storeCache.LoadedData.includes(this.pageApp);

      if (pageAppCheck) {
        this.isPageLoading = false;
        return;
      };
    },

    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 1) {
        setTimeout(() => {
          if (this.$props.success) {
            this.isPageLoading = false;
            this.storeCache.LoadedData.push(this.pageApp);
          }
        }, this.configApp.skeletonTime);
      };
    },

    getGiftData(giftKey: string) {
      const appData = this.storeCache.NftsAppData;
      const array = Array.isArray(appData) ? appData : Object.values(appData || {});
      const rawArray = array.map(g => toRaw(g));
      return rawArray.find((gift: any) => gift.nftKey === giftKey);
    },

    openCollection(nftKey: string) {
      TelegramModule.useSoftHaptic();
      this.$router.push({ 
        name: 'collection', 
        params: { nft: nftKey }
      });
    },

    openActivity() {
      TelegramModule.useSoftHaptic();
      this.$router.push({ 
        name: 'activity', 
        params: { }
      });
    },

    openRating() {
      TelegramModule.useSoftHaptic();
      this.$router.push('/rating');
    },

    async initHistory() {
      const historyGet = await historyApi.getAll();
      if (historyGet) {
        this.storeCache.HistoryApp = historyGet;
      }
    }
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/home/_main.sass"
@use "@/assets/styles/home/_comp.sass"
// Filter modals: global via App.vue → _filter-modals.sass
</style>