<template>
  <div class="_direction _comp _item _multicheckButton" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_blockButton">
        </div>
      </div>
      <div v-else class="_content">
        <div class="_blockButton">
          <button
            class="_primary"
            :class="{ _loading: isLoadingCreateButton }"
          >
            <h4>Pay {{ CompContextData.price }}</h4>
            <img style="margin-left: -5px;" :src="Image_StarsWhite" alt="">
            <Lottie 
              class="lt" 
              slug="loading-spin" 
              :loop="true"
              width="75"
              height="75"
              renderer="svg"
            />
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Lottie from '../Lottie.vue';

import Image_StarsWhite from '@/assets/images/stars-white.png';

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
      isLoadingCreateButton: false,

      Image_StarsWhite,
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
    },
  },
};
</script>