<template>
  <section class="_wrap _privateDeal" :class="{ desktop: isDesktop() }">
    <div class="_view">

      <Title
        class="_lefting"

        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :Text="$t('privateDeal.title')"
        Key="_upcoming"

        :ImageShow="false"
      />

      <Description
        class="_lefting"

        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :Text="$t('privateDeal.description')"
      />

      <Sections
        @loadSuccess="handleLoadSuccess"
        @setSection="setSection"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :Section="Section"
      />

      <Create
        v-if="Section === 'Create'"
        
        class="_lefting"

        @loadSuccess="handleLoadSuccess"
        @dataGift="dataGift"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :InputLabel="$t('privateDeal.label1')"
        :InputImage="Image_Stars"
        :InputPlaceholder="'1250'"
      />

      <Deals
        v-if="Section === 'Deals'"

        @loadSuccess="handleLoadSuccess"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
      />

      <Button
        v-if="Section === 'Create'"

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
import Description from '../components/Root/Description.vue';
import Button from '../components/PrivateDeal/Button.vue'
import Sections from '../components/PrivateDeal/Sections.vue'
import Create from '../components/PrivateDeal/Create.vue'
import Deals from '../components/PrivateDeal/Deals.vue'

import Image_Stars from '@/assets/images/stars.png';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Title,
    Description,
    Button,
    Sections,
    Create,
    Deals,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore() as any,
      
      handleLoads: 0,
      propsSuccess: this.$props.success,
      isPageLoading: true,

      Section: "Create",

      CompDataGift: {
        userId: null,
        price: 0,
        nftCount: 0,
        nftIds: []
      },

      isDesktop,

      Icon,
      Image_Stars,
    };
  },

  mounted() {
    TelegramModule.hideBackButton();
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

    setSection(section: string) {
      this.Section = section;
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/private_deal/_main.sass"
@use "@/assets/styles/private_deal/_comp.sass"
</style>