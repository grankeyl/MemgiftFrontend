<template>
  <section class="_wrap _home" :class="{ desktop: isDesktop() }">
    <div class="_view">

      <div class="title">
        <img src="/logotype.svg" alt="logotype" />
      </div>

      <Slider
        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :slides="SlidesList" 
      />

      <transition name="fade-history" mode="out-in">
        <div v-if="getFirstHistory" class="_direction _comp _item _lastActivity _lefting" :key="getFirstHistory.id">
          <div class="_content" @click="openActivity()">
            <div 
              class="_block"
              :class="getFirstHistory?.gift_rarity || ''"
            >
              <div class="_image">
                <img :src="getFirstHistory.gift_image" />
              </div>
              <div class="_title">
                <h4 v-if="getFirstHistory.status === 'purchased'">
                  {{ getFirstHistory.user_name }}
                  <p>{{ $t('home.buyed') }}</p>
                  <span @click="openCollection(getFirstHistory?.u_key)">
                    {{ getFirstHistory?.gift_name }}
                  </span>
                </h4>
                <h4 v-if="getFirstHistory.status === 'transferred'">
                  {{ getFirstHistory.from_user_name }}
                  <p>{{ $t('home.sended') }}</p>
                  <span @click="openCollection(getFirstHistory?.u_key)">
                    {{ getFirstHistory?.gift_name }}
                  </span>
                </h4>
                <p>{{ unixToRelative(getFirstHistory.created_at) }}</p>
              </div>
              <div class="_button">
                <button>
                  <div class="kit-icon" v-html="Icon.ChevroneRight"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <Title
        class="_lefting"

        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :Text="$t('home.gift_store_title')"
        Key="_upcoming"

        :ImageShow="false"
      />

      <Gifts
        class="_lefting"

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
  },

  data() {
    return {
      pageApp: 'Home',
      configApp: getConfig(),
      storeCache: useCacheStore() as any,
      
      handleLoads: 0,
      propsSuccess: this.$props.success,
      isPageLoading: true,

      PremiumGiftKey: "TonWheel",
 
      SlidesList: [
        {
          id: 0,
          Title: this.$t('home.slider_5'),
          Button: "Author",
          ButtonText: this.$t('home.slider_button_5'),
          ButtonKey: "WhorGirl",
          ButtonSlide: "first",
          ImageContent: "/home/banner-5-image.png",
          BgImage: "/home/banner-5.png",
          ButtonLink: typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_AFFILIATE
          ? import.meta.env.VITE_APP_AFFILIATE
          : null,
        },
        {
          id: 1,
          Title: this.$t('home.slider_1'),
          Button: "Buy",
          ButtonText: "500",
          ButtonKey: "Chillguy",
          ButtonSlide: "first",
          ImageContent: "",
          BgImage: "/home/banner.png",
        },
        {
          id: 3,
          Title: this.$t('home.slider_2'),
          Button: "Reading",
          ButtonText: this.$t('home.slider_button'),
          ButtonIcon: Icon.ChevroneRight,
          ButtonSlide: "other",
          ImageContent: "/home/banner-2-image.png",
          BgImage: "/home/banner-2.png",
          ButtonLink: typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_AFFILIATE
          ? import.meta.env.VITE_APP_AFFILIATE
          : null,
        },
      ],

      Icon,
      isDesktop,
      getImageUrl,
      unixToRelative,
      pluralizeGift,
    };
  },

  mounted() {
    TelegramModule.hideBackButton();

    this.SlidesList.forEach((slide, index) => {
      if (index === 1) {
        try {
          slide.ButtonKey = this.PremiumGiftKey;
          slide.ButtonText = this.storeCache.NftsAppData[this.PremiumGiftKey].Price;
          slide.ImageContent = this.storeCache.NftsAppData[this.PremiumGiftKey].ImageMain;
        } catch {}
      }
    });

    this.initHistory();

    this.$watch(
      () => this.storeCache.NftsAppData,
      (newValue) => {
        if (newValue) {
          this.SlidesList.forEach((slide, index) => {
            if (index === 1) {
              try {
                slide.ButtonKey = this.PremiumGiftKey;
                slide.ButtonText = newValue[this.PremiumGiftKey].Price;
                slide.ImageContent = newValue[this.PremiumGiftKey].ImageMain;
              } catch {}
            }
          });
        }
      }
    );
  },

  methods: {
    checkPageApp() {
      const pageAppCheck = this.storeCache.LoadedData.includes(this.pageApp);

      if (pageAppCheck) {
        this.isPageLoading = false;
        return;
      };
    },

    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 2) {
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
</style>