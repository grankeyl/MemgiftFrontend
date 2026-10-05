<template>
    <div class="_direction _comp _item _activityRecents blockTasks">
        <div v-if="isLoading" class="_skeleton">
          <div class="_list-skel">
            <div class="_row-skel" v-for="n in 3" :key="'act-sk-' + n">
              <div class="_avatar-skel _load-shimmer"></div>
              <div class="_info-skel">
                <div class="_title-skel _load-shimmer"></div>
                <div class="_reward-skel _load-shimmer"></div>
              </div>
              <div class="_action-skel _load-shimmer"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_section-head">
            <h4>{{ $t('collection.recentsTitle') }}</h4>
          </div>

          <transition-group name="fade-history" tag="div" class="_task-list">
            <div
              v-for="(history, index) in HistoryList"
              :key="history.created_at || index"
              class="_task-row _activity-row"
              :class="history.gift_rarity || ''"
              @click="openCollection(history.u_key)"
            >
              <div class="_task-avatar _activity-avatar" :class="history.gift_rarity || ''">
                <img v-if="history.gift_image" :src="history.gift_image" :alt="history.gift_name" />
                <div v-else class="kit-icon" v-html="Icon.Gift"></div>
              </div>

              <div class="_task-info">
                <h4>
                  <template v-if="history.status === 'purchased'">
                    {{ maxNameLength(cleanString(history.user_name)) }}
                    {{ $t('home.buyed') }}
                    <span>{{ history?.gift_name }}</span>
                  </template>
                  <template v-else-if="history.status === 'transferred'">
                    {{ maxNameLength(cleanString(history.from_user_name)) }}
                    {{ $t('home.sended') }}
                    <span>{{ history?.gift_name }}</span>
                  </template>
                </h4>
                <p class="_activity-time">{{ unixToRelative(history.created_at) }}</p>
              </div>

              <div class="_task-action _activity-action">
                <span class="_activity-chevron" aria-hidden="true">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d="M1 1.5 6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </transition-group>
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