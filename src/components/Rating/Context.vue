<template>
  <div :class="['_direction _comp _item _contextRating', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_block">
        <div class="_title"></div>
        <div class="_descr"></div>
      </div>
    </div>
    <div v-else class="_content">
      <div class="_block">
        <h2 class="rt-title">{{ $t('rating.title') }}</h2>
        <p class="rt-descr">{{ $t('rating.description') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Image_Rating from '@/assets/images/rating.png';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
  },

  data() {
    return { isLoading: this.Skeleton, Image_Rating };
  },

  mounted() { this.loadResources(); },

  computed: {
    isLoading() { return this.Skeleton; },
  },

  methods: {
    async loadResources() {
      try {
        await document.fonts.ready;
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Error loading resources:", error);
      }
    },
  },
};
</script>
