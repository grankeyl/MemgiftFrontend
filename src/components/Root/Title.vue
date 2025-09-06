<template>
  <div :class="['_direction _comp _item _title', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_text"><h4></h4></div>
      <div v-if="ImageShow" class="_image"></div>
    </div>
    <div v-else class="_content">
      <div class="_text"><h4>{{ Text }}</h4></div>
      <div v-if="ImageShow" class="_image">
        <img :src="Image" alt="image" />
      </div>
      <div v-if="Page != 'Any'" class="_titleTickets">
        <img :src="Image_Ticket" alt="button" />
        <p>{{ storeCache.UserData.Tickets || 0 }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Image_Ticket from '@/assets/images/ticket.svg';

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
    },
    Key: {
      type: String,
      required: false,
    },
    ImageShow: {
      type: Boolean,
      default: false,
    },
    Image: {
      type: String,
      required: false,
    },
    Page: {
      type: String,
      default: "Any",
    }
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,

      Image_Ticket,
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
        this.storeCache.UserData.user.Tickets = this.storeCache.UserData.user.Tickets || 0;
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