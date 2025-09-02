<template>
  <section class="_wrap _deal" :class="{ desktop: isDesktop() }">
    <div class="_view">
      
      <div class="_first" :class="{ desktop: isDesktop() }">
        <Context
          @loadSuccess="handleLoadSuccess"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
          :CompContextData="CompContextData"
        />
      </div>

      <Gifts
        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
      />

      <Button
        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :CompContextData="CompContextData"
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

import Context from '../components/Deal/Context.vue';
import Gifts from '../components/Deal/Gifts.vue';
import Button from '../components/Deal/Button.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Context,
    Gifts,
    Button,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore() as any,
      
      handleLoads: 0,
      propsSuccess: this.$props.success,
      isPageLoading: true,

      CompContextData: {
        countGifts: 0,
        price: 0,
      },

      Icon,
      isDesktop,
    };
  },

  mounted() {
    TelegramModule.hideBackButton();
  },

  methods: {
    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 1) {
        setTimeout(() => {
          if (this.$props.success) {
            this.isPageLoading = false;
          }
        }, this.configApp.skeletonTime);
      };
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/deal/_main.sass"
@use "@/assets/styles/deal/_comp.sass"
</style>