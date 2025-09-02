<template>
  <div :class="['_direction _comp _item _description', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_text"><p></p></div>
    </div>
    <div v-else class="_content">
      <div class="_text"><p>{{ Text }}</p></div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';

import * as balanceApi from '../../api/balanceApi';

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
    Text: {
      type: String,
      required: true,
    }
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,
    };
  },

  mounted() {
    this.loadResources();
    this.getTickets();

    this.$watch(() => this.storeCache.TelegramData, () => {
      this.getTickets();
    });
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
  },

  methods: {
    async getTickets() {
      try {
        this.storeCache.UserData.Tickets = this.storeCache.UserData.Tickets || 0;
      } catch {}
    },

    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImage()]);
        this.$emit("loadSuccess");
      } catch {}
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImage() {
      if (!this.ImageShow || !this.Image) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = this.Image;
        img.onload = resolve;
        img.onerror = reject;
      });
    },
  },
};
</script>