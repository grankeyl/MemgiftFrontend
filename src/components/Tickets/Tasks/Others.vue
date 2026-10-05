<template>
  <div class="_direction _comp _item _othersTasks blockTasks" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_list-skel">
          <div class="_row-skel">
            <div class="_avatar-skel _load-shimmer"></div>
            <div class="_info-skel">
              <div class="_title-skel _load-shimmer"></div>
              <div class="_reward-skel _load-shimmer"></div>
            </div>
            <div class="_action-skel _load-shimmer"></div>
          </div>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_section-head">
          <h4>{{ $t('tickets.othersTitle') }}</h4>
        </div>

        <div class="_task-list">
          <div v-for="(task, index) in TasksData" :key="index" class="_task-row">
            <div class="_task-avatar">
              <div class="kit-icon" v-html="Icon.Gift"></div>
            </div>
            <div class="_task-info">
              <h4>
                {{ $t('app.sendGift') }}
                {{ task.config.SendCount }} 
                {{ pluralizeGift(
                  $t('app.sendGiftText'),
                  task.config.SendCount, 
                  storeCache.TelegramData.user.language
                ) }}
              </h4>
              <div class="_task-reward">
                  <Icon class="kit-icon" v-html="Icon.Ticket"></Icon>
                  <p>{{ task?.rewards?.[0]?.amount }}</p>
              </div>
            </div>

            <div v-if="task.type === 'send_gift'" class="_task-action">
              <button v-if="(!task.user_status || task.user_status === 'new') && !task.isLoading && !SendGiftTaskCheck(task)" @click="openProfile()" class="_btn _count">
                <span>{{ progressCurrent(task) }}/{{ task.config.SendCount }}</span>
              </button>
              <button v-if="task.user_status !== 'completed' && SendGiftTaskCheck(task) && !task.isLoading" @click="clickTask(task)" class="_btn _claim">
                <span>{{ $t('tickets.taskButtonClaim') }}</span>
              </button>
              <button v-if="task.user_status === 'completed' && !task.isLoading" class="_btn _done">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </button>
              <button v-if="task.user_status === 'in_progress' || task.isLoading" class="_btn _loading">
                <Lottie class="lt" slug="loading-spin" :loop="true" width="25" height="25" renderer="svg" />
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '@/hooks/useTelegram';

import { Icon } from '@/components/Icon';
import { useCacheStore } from '@/stores/pinia/piniaStore';
import { pluralizeGift } from '@/utils/useGift';

import * as taskApi from '@/api/taskApi';

import Lottie from '@/components/Lottie.vue';

import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_TicketImage from '@/assets/images/tickets-image.png';
import { shootConfetti } from '../../../utils/useConfetti';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    },
    TasksData: {
      type: Array,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,

      pluralizeGift,

      Icon,
      Image_Ticket,
      Image_TicketImage,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    TasksData() {
      return this.$props.TasksData;
    }
  },
  
  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch {}
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const staticImages = [
        Image_Avatar,
        Image_Ticket,
        Image_TicketImage,
      ].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...staticImages]);
    },

    progressCurrent(task) {
      if (!task.config) return 0;
      return Math.min(this.storeCache.UserData.sent_user || 0, task.config.SendCount);
    },

    progressPercent(task) {
      if (!task.config || !task.config.SendCount) return 0;
      const current = this.storeCache.UserData.sent_user || 0;
      return Math.min(100, (current / task.config.SendCount) * 100);
    },

    SendGiftTaskCheck(task) {
      if (!task.rewards) return false;
      return this.storeCache.UserData.sent_user >= task.config.SendCount;
    },

    async useTask(task) {
      if (task.user_status && task.user_status === 'completed') return;
      const use = await taskApi.use(task.id);
      if (use) {
        this.claimTask(task);
      }
    },

    openProfile() {
      this.$router.push('/profile');
    },

    async clickTask(task) {
      if (task.user_status && task.user_status === 'completed') {
        if (task.type === 'send_gift') {
          this.openProfile();
          return;
        }
      }

      if (task.type === 'send_gift') {
        this.useTask(task);
      }
    },

    async claimTask(task) {
      const response = await taskApi.claim(task.id);

      if (response && response.status === 'completed') {
        task.user_status = response.status;
        TelegramModule.useMediumHaptic();
        shootConfetti();

        if (task.rewards[0].type === 'tickets') {
          this.storeCache.UserData.user.Tickets += response.awarded;
        };
      }
    },
  },
};
</script>
