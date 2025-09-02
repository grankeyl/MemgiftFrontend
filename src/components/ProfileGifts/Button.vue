<template>
  <div class="_direction _comp _item _profileButtonMulticheck" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_blockButton">
          <button>
            <h4>Create multicheck</h4>
          </button>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_blockButton">
          <button>
            <h4>Create multicheck</h4>
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import Lottie from '../Lottie.vue';

import Image_Avatar from '@/assets/images/avatar.png';

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
      isLoading: this.$props.Skeleton,
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
        Image_Avatar,
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