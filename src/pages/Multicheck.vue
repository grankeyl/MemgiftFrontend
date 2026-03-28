<template>
  <section class="_wrap _multicheck" :class="{ desktop: isDesktop() }">
    <div class="_view">

      <Title
        class="_lefting"

        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :Text="$t('multicheck.title')"
        Key="_upcoming"

        :ImageShow="false"
      />

      <Gifts
        class="_lefting"
        @dataGift="dataGift"

        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
      />

      <Button
        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :CompDataGift="CompDataGift"
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

import Title from '../components/Root/Title.vue';
import Gifts from '../components/Multicheck/Gifts.vue'
import Button from '../components/Multicheck/Button.vue'

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Title,
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

      CompDataGift: {
        userId: null,
        nftName: null,
        nftUniqueKey: null,
        nftCount: 0,
        nftIds: []
      },

      Icon,
      isDesktop,
    };
  },

  mounted() {
    TelegramModule.useBackButton(() => {
      this.$router.push('/profile');
    });
  },

  methods: {
    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 3) {
        setTimeout(() => {
          if (this.$props.success) {
            this.isPageLoading = false;
          }
        }, this.configApp.skeletonTime);
      };
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