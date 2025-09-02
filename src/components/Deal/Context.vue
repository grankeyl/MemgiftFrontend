<template>
  <div class="_direction _comp _item _context" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_title"></div>
        <div class="_amount"></div>
      </div>
      <div v-else class="_content">
        <div class="_title">
          <h4>{{ CompContextData.countGifts }} Gifts</h4>
        </div>
        <div class="_amount">
          <img :src="Image_Stars" alt="stars" />
          <p>{{ CompContextData.price }}</p>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '../../hooks/useTelegram';

import { useCacheStore } from '../../stores/pinia/piniaStore';

import Lottie from '../Lottie.vue';

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
    CompContextData: {
      type: Object,
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