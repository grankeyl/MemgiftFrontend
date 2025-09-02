<template>
  <section class="_wrap _tickets" :class="{ desktop: isDesktop() }">
    <div class="_view">
      
      <div class="_first" :class="{ desktop: isDesktop() }">
        <Context
          @loadSuccess="handleLoadSuccess"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
        />

        <TasksPinned
          @loadSuccess="handleLoadSuccess"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"

          :TasksData="storeCache.TasksApp.pinned"
        />
      </div>

      <div class="_second">
        <TasksPartners
          @loadSuccess="handleLoadSuccess"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"

          :TasksData="storeCache.TasksApp.partners"
        />

        <TasksOthers
          @loadSuccess="handleLoadSuccess"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"

          :TasksData="storeCache.TasksApp.others"
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

import Context from '../components/Tickets/Context.vue';
import Recent from '../components/Tickets/Recent.vue';

import TasksPinned from '../components/Tickets/Tasks/Pinned.vue';
import TasksPartners from '../components/Tickets/Tasks/Partners.vue';
import TasksOthers from '../components/Tickets/Tasks/Others.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Context,
    Recent,

    TasksPinned,
    TasksPartners,
    TasksOthers,
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
@use "@/assets/styles/tickets/_main.sass"
@use "@/assets/styles/tickets/_comp.sass"
</style>