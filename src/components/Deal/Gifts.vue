<template>
  <div class="_direction _comp _item _giftsBlock" :class="Key">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div v-else class="_content">
        <div class="_block">
          <div class="_gifts">
            <div v-for="index in 9" class="_gift rare">
              <div class="_symbols">
                <img :src="Image_GiftBg" alt="rarity" />
              </div>
              <div class="_nft">
                <img :src="'https://app.spicko-quane.shop/s3/gifts/gift_durov.svg'" alt="nft" />
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '../../hooks/useTelegram';

import { useCacheStore } from '../../stores/pinia/piniaStore';

import Lottie from '../Lottie.vue';

import Image_Stars from '@/assets/images/stars.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    }
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,

      Image_Stars,
      Image_GiftBg,
    };
  },

  mounted() {
    this.loadResources();

    this.$watch(() => this.storeCache.TelegramData, () => {
    });
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
  },
  
  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const staticImages = [].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...staticImages]);
    }
  },
};
</script>