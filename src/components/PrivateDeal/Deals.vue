<template>
  <div class="_direction _comp _item _privateDeals" :class="Key">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div v-else class="_content">
        <div class="_items">
          <div v-for="index in 5" class="_item">
            <div class="_left">
              <div class="_title">
                <h4>Deal #13</h4>
              </div>
              <div class="_stars">
                <img :src="Image_Stars" alt="stars" />
                <span>100</span>
              </div>
            </div>
            <div class="_right">
              <div class="_delete">
                <div class="kit-icon" v-html="Icon.Trash"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { Icon } from '@/components/Icon';
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
    }
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,

      Icon,
      Image_Stars,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    }
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
      const staticImages = [
        Image_Stars,
      ].map((src) => {
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