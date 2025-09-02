<template>
  <div class="_direction _comp _item _sect" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_blockButton">
        </div>
      </div>
      <div v-else class="_content">
        <div @click="setSection('Create')" class="_section" :class="{ _active: Section === 'Create' }">
          <h4>Создать сделку</h4>
        </div>
        <div @click="setSection('Deals')" class="_section numeric" :class="{ _active: Section === 'Deals' }">
          <h4>Все сделки</h4>
          <span>5</span>
        </div>
      </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Lottie from '../Lottie.vue';

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
    Section: {
      type: String,
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

    setSection(section) {
      this.$emit("setSection", section);
    },
  },
};
</script>