<template>
  <div class="_wrap mc-page" :class="{ desktop: isDesktop() }">
    <div class="_view">
      <div class="display">
        <div class="mc-top">
          <h1>{{ $t('multicheck.title') }}</h1>
          <p>{{ $t('multicheck.subtitle') }}</p>
        </div>

        <Gifts
          @dataGift="dataGift"
          @loadSuccess="handleLoadSuccess"
          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
        />
      </div>
    </div>

    <Button
      @loadSuccess="handleLoadSuccess"
      :Skeleton="isPageLoading"
      :SkeletonTime="configApp.skeletonTime"
      :CompDataGift="CompDataGift"
    />
  </div>
</template>

<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { getConfig } from '../config';

import Gifts from '../components/Multicheck/Gifts.vue';
import Button from '../components/Multicheck/Button.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Gifts,
    Button,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore() as any,

      handleLoads: 0,
      isPageLoading: true,

      CompDataGift: {
        userId: null,
        nftName: null,
        nftUniqueKey: null,
        nftCount: 0,
        nftIds: [] as any[],
        tab: 'purchased',
        giftsSummary: [] as any[],
        selectedItems: [] as any[],
      },

      isDesktop,
    };
  },

  mounted() {
    TelegramModule.useBackButton(() => this.goBack());
  },

  methods: {
    goBack() {
      this.$router.push({ name: 'profile' });
    },

    handleLoadSuccess() {
      this.handleLoads++;
      if (this.handleLoads >= 2) {
        setTimeout(() => {
          this.isPageLoading = false;
        }, this.configApp.skeletonTime);
      }
    },

    dataGift(data: any) {
      this.CompDataGift = data;
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/multicheck/_main.sass"
@use "@/assets/styles/multicheck/_comp.sass"
</style>
