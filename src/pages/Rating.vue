<template>
  <section class="_wrap _rating" :class="{ desktop: isDesktop() }">
    <div class="_view">

      <Context
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
      />

      <Top
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
      />

    </div>
  </section>
</template>

<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';
import { getConfig } from '../config';

import Context from '../components/Rating/Context.vue';
import YourTop from '../components/Rating/YourTop.vue';
import Top from '../components/Rating/Top.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Context,
    YourTop,
    Top,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore() as any,
      
      handleLoads: 0,
      propsSuccess: this.$props.success,
      isPageLoading: true,

      YourTopComp: {
        YourPhoto: null as any,
        YourName: null as any,
        YourGiftsCount: 0,
      },
      
      Icon,
      isDesktop,
    };
  },

  mounted() {
    TelegramModule.hideBackButton();
    this.YourTopCompInit();

    this.$watch(() => this.storeCache.TelegramData, () => {
      this.YourTopCompInit();
    });

    this.$watch(() => this.storeCache.UserData, () => {
      this.YourTopCompInit();
    });
  },

  methods: {
    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 2) {
        setTimeout(() => {
          this.isPageLoading = false;
        }, this.configApp.skeletonTime);
      };
    },

    YourTopCompInit() {
      if (!this.storeCache.TelegramData?.user) {
        return;
      }

      const Image = this.storeCache.TelegramData.user.photoUrl || '';
      const FullName = `${this.storeCache.TelegramData.user.firstName} ${this.storeCache.TelegramData.user.lastName}`;

      this.YourTopComp.YourPhoto = Image;
      this.YourTopComp.YourName = FullName;
      this.YourTopComp.YourGiftsCount = this.storeCache.UserData;
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/rating/_main.sass"
@use "@/assets/styles/rating/_comp.sass"
</style>