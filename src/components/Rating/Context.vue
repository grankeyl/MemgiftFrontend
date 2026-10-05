<template>
  <div :class="['_direction _comp _item _contextRating', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_block">
        <div class="_title"></div>
        <div class="_descr"></div>
      </div>
    </div>
    <div v-else class="_content">
      <div class="rt-head">
        <div class="rt-head__info">
          <div class="rt-head__badge">
            <div class="kit-icon" v-html="Icon.Rating || Icon.Gift"></div>
            <span>{{ $t('menu.rating') }}</span>
          </div>
          <h2 class="rt-head__title">{{ $t('rating.title') }}</h2>
          <p class="rt-head__descr">{{ $t('rating.description') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    Key: { type: String, default: '' },
  },

  data() {
    return {
      isLoading: this.Skeleton,
      Icon,
    };
  },

  mounted() {
    this.loadResources();
  },

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
