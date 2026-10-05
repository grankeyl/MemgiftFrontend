<template>
  <section class="_wrap _tickets" :class="{ desktop: isDesktop() }">
    <div class="bluring-t"></div>
    <div class="bluring-b"></div>
    <div class="_view">
      <div class="title">
        <h4>
          {{ $t('tickets.title') }}
        </h4>
        <div class="balances">
          <div class="balance">
            <Icon class="kit-icon ticket" v-html="Icon.Ticket" />
            <span>{{ storeCache.UserData.user.Tickets || 0 }}</span>
          </div>
          <div class="balance" @click="openWallet">
            <Icon class="kit-icon" v-html="Icon.Gram" />
            <span>{{ cutNumber(getBalance.toString()) }}</span>
          </div>
        </div>
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
import { cutNumber } from '@/utils/useTon.ts';

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
      cutNumber,
    };
  },

  computed: {
    allTasks(): any[] {
      const pinned = this.storeCache.TasksApp?.pinned || [];
      const partners = this.storeCache.TasksApp?.partners || [];
      const others = this.storeCache.TasksApp?.others || [];
      return [...pinned, ...partners, ...others];
    },
    totalTasks(): number {
      return this.allTasks.length;
    },
    completedTasks(): number {
      return this.allTasks.filter((t: any) => t.user_status === 'completed').length;
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  mounted() {
    TelegramModule.hideBackButton();
  },

  methods: {
    openWallet() { this.$router.push('/wallet'); },
    handleLoadSuccess() {
      this.handleLoads ++;

      if (this.handleLoads >= 2) {
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
