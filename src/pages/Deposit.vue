<template>
  <div 
    class="_wrap _deposit flex-grow-scroll" 
    :class="{ desktop: isDesktop() }"
  >
    <div class="_view">

      <Title
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :Text="$t('deposit.title')"
        Key="_default"
        :ImageShow="false"
      />

      <Description
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :Text="$t('deposit.description')"
        Key="_default"
      />

      <Block
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :Label="$t('deposit.label1')"
        :ButtonText="$t('deposit.buttonDeposit')"
        Key="_default"
      />

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getConfig } from '../config';
import { useSelector } from '../helpers/helpers';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { checkLoaded } from '../utils/checkLoaded';

import Title from '../components/Root/Title.vue';
import Description from '../components/Root/Description.vue';
// import Block from '../components/Deposit/Block.vue';

export default defineComponent({
  components: {
    Title,
    Description,
  },

  setup() {
    const pageApp = ref('Deposit');
    const configApp = ref(getConfig());
    const storeCache = useCacheStore() as any;
    const userApp = useSelector((state) => state.auth.user);

    const handleLoads = ref(0);
    const isPageLoading = ref(true);

    const pageEmit = () => {
      checkLoaded((event: string) => (event as any));
    };

    const handleLoadSuccess = () => {
      handleLoads.value++;

      if (handleLoads.value >= 3) {
        setTimeout(() => {
          isPageLoading.value = false;
          storeCache.LoadedData.push(pageApp.value);
        }, configApp.value.skeletonTime);
      }
    };

    onMounted(() => {
      pageEmit();
    });

    return {
      configApp,
      storeCache,
      userApp,
      handleLoads,
      isPageLoading,
      isDesktop,
      handleLoadSuccess,
    };
  }
});
</script>

<style lang="sass">
@use "@/assets/styles/deposit/_main.sass"
@use "@/assets/styles/deposit/_comp.sass"
</style>