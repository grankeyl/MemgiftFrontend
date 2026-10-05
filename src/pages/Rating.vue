<template>
  <section class="_wrap _rating" :class="{ desktop: isDesktop() }">
    <div class="bluring-t"></div>
    <div class="bluring-b"></div>
    <div class="_view">
      <div class="title">
        <h4>
          {{ $t('menu.rating') }}
        </h4>
        <div class="balance">
          <Icon class="kit-icon" v-html="Icon.Gram" />
          <span>{{ cutNumber(getBalance.toString()) }}</span>
        </div>
      </div>
      <div class="_second">
        <Top
          @loadSuccess="handleLoadSuccess"
          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';
import { getConfig } from '../config';
import { cutNumber } from '@/utils/useTon';

import Top from '../components/Rating/Top.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Top,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore() as any,
      
      handleLoads: 0,
      propsSuccess: this.$props.success,
      isPageLoading: true,

      Icon,
      isDesktop,
      cutNumber,
    };
  },

  computed: {
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  mounted() {
    TelegramModule.hideBackButton();
  },

  methods: {
    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 1) {
        setTimeout(() => {
          this.isPageLoading = false;
        }, this.configApp.skeletonTime);
      };
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/rating/_main.sass"
@use "@/assets/styles/rating/_comp.sass"
</style>