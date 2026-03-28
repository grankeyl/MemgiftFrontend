<template>
  <div :class="['_direction _comp _item _purchased', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_block">
        <div class="_image"></div>
        <div class="_title"></div>
        <div class="_descr"></div>
      </div>
    </div>
    <div v-else class="_content">
      <div class="_block">
        <div class="_background">
          <img :src="Background" />
        </div>

        <div class="mc-success">
          <div class="mc-success__icon">
            <div class="mc-success__ring"></div>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <h2 class="mc-success__title">{{ Text }}</h2>

          <div v-if="summary.length" class="mc-success__list">
            <div class="mc-success__item" v-for="(g, i) in summary" :key="i">
              <div class="mc-success__item-img">
                <img v-if="g.image" :src="g.image" alt="" />
              </div>
              <span class="mc-success__item-name">{{ g.name }}</span>
              <span class="mc-success__item-count">×{{ g.count }}</span>
            </div>
          </div>

          <p class="mc-success__subtitle">{{ Descr }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '@/stores/pinia/piniaStore';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    Background: { type: String, required: true },
    NftImage: { type: String, required: true },
    Text: { type: String, required: true },
    Descr: { type: String, required: true },
  },

  data() {
    return {
      storeCache: useCacheStore(),
    };
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    summary() {
      return this.storeCache.LastMulticheckSummary || [];
    },
  },

  mounted() {
    this.loadResources();
  },

  methods: {
    async loadResources() {
      try {
        await document.fonts.ready;
        this.$emit("loadSuccess");
      } catch {
        this.$emit("loadSuccess");
      }
    },
  },
};
</script>
