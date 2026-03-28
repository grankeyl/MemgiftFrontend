<template>
    <div class="_direction _comp _item _ads">
        <div v-if="isLoading" class="_skeleton">
          <div class="_banner-skel"></div>
        </div>
        <div v-else class="_content">
          <div class="_banner" @click="buy">
            <div class="_banner-left">
              <span class="_banner-star">⭐</span>
              <span class="_banner-label">{{ $t('collection.adsBanner.title') }}</span>
            </div>
            <div class="_banner-btn">
              <span>{{ $t('collection.adsBanner.button') }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>
    </div>
  </template>
  
  <script>
  import * as historyApi from '../../api/historyApi';
  import { checkPriceNumber } from '../../utils/useGift';
  import { unixToRelative } from '../../utils/useApp';
  import { cleanString } from '../../utils/useApp';

  import Image_Stars from '@/assets/images/stars.png';
  import TelegramModule from '../../hooks/useTelegram';

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
        isLoading: this.Skeleton,

        cleanString,
        checkPriceNumber,
        unixToRelative,

        Image_Stars,
      };
    },
  
    mounted() {
      this.loadResources();
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },
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

      buy() {
        TelegramModule.useMediumHaptic();
        TelegramModule.useLink('https://t.me/MemGiftStarBot');
      }
    }
  };
  </script>