<template>
    <div class="_direction _comp _item _activityRecents">
        <div v-if="isLoading" class="_skeleton">
          <div class="_items">
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_items">

            <transition-group name="fade-history" tag="div" class="_items">
              <div
                v-for="(history, index) in HistoryList"
                :key="history.CreatedAt || index"
                class="_direction _comp _item _lastActivity _lefting"
              >
                <div class="_content" @click="openCollection(history.u_key)">
                  <div
                    class="_block"
                    :class="history.gift_rarity || ''"
                  >
                    <div class="_image">
                      <img :src="history.gift_image" />
                    </div>
                    <div class="_title">
                      <h4 v-if="history.status === 'purchased'">
                        {{ maxNameLength(cleanString(history.user_name)) }}
                        {{ $t('home.buyed') }}
                        <span>
                          {{ history?.gift_name }}
                        </span>
                      </h4>
                      <h4 v-if="history.status === 'transferred'">
                        {{ maxNameLength(cleanString(history.from_user_name)) }}
                        {{ $t('home.sended') }}
                        <span>
                          {{ history?.gift_name }}
                        </span>
                      </h4>
                      <p>{{ unixToRelative(history.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
            
          </div>
        </div>
    </div>
  </template>
  
  <script>
  import * as historyApi from '../../api/historyApi';

  import TelegramModule from '../../hooks/useTelegram';

  import { toRaw } from 'vue';
  import { checkPriceNumber } from '../../utils/useGift';
  import { cleanString } from './../../utils/useApp';
  import { Icon } from '../Icon';
  import { getImageUrl, unixToRelative } from './../../utils/useApp';
  import { useCacheStore } from '../../stores/pinia/piniaStore';

  import Image_Stars from '@/assets/images/stars.png';

  export default {
    props: {
      Skeleton: {
        type: Boolean,
        required: true,
      },
      SkeletonTime: {
        type: Number,
        required: true,
      },
    },

    data() {
      return {
        storeCache: useCacheStore(),

        isLoading: this.Skeleton,

        HistoryList: [],
        intervalHistory: undefined,

        cleanString,
        
        checkPriceNumber,
        unixToRelative,
        getImageUrl,

        Icon,
        Image_Stars,
      };
    },
  
    mounted() {
      this.loadResources();

      this.intervalHistory = setInterval(() => {
        this.cycleHistory();
      }, 20000);
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },
      HistoryList() {
        return this.storeCache.HistoryApp;
      }
    },

    beforeUnmount() {
      if (this.intervalHistory !== undefined) {
        clearInterval(this.intervalHistory);
      }
    },

    methods: {
      async loadResources() {
        try {
          await Promise.all([this.loadFonts(), this.loadIcons()]);
          this.isLoading = false;
          this.$emit("loadSuccess");
        } catch (error) {
          console.error("Ошибка при загрузке ресурсов:", error);
        }
      },

      loadFonts() {
        return document.fonts.ready;
      },

      loadIcons() {
        return new Promise((resolve, reject) => {
          const div = document.createElement("div");
          div.innerHTML = this.Icon;

          const icons = div.querySelectorAll("img, svg");
          const promises = Array.from(icons).map((icon) => {
            if (icon.tagName === "IMG") {
              return new Promise((resolveImage, rejectImage) => {
                const img = new Image();
                img.src = icon.src;
                img.onload = resolveImage;
                img.onerror = rejectImage;
              });
            } else {
              return Promise.resolve();
            }
          });

          Promise.all(promises).then(resolve).catch(reject);
        });
      },

      getGiftData(giftKey) {
        const appData = this.storeCache.NftsAppData;
        const array = Array.isArray(appData) ? appData : Object.values(appData || {});
        const rawArray = array.map(g => toRaw(g));
        return rawArray.find((gift) => gift.nftKey === giftKey);
      },

      maxNameLength(str) {
        return str.length > 12 ? `${str.slice(0, 12)}...` : str;
      },

      async cycleHistory() {
        const historyGet = await historyApi.getAll();
        if (!historyGet) return;
        this.storeCache.HistoryApp = historyGet;
      },

      openCollection(nftKey) {
        TelegramModule.useSoftHaptic();
        this.$router.push({ 
          name: 'collection', 
          params: { nft: nftKey }
        });
      },
    }
  };
  </script>