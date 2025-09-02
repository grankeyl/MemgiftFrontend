<template>
  <div class="_direction _comp _item _othersTasks" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_block">
        </div>
      </div>
      <div v-else class="_content">
        <div class="_block">
          <div class="_blockHead">
            <div class="_blockHeadTitle">
              <h4>{{ $t('tickets.othersTitle') }}</h4>
            </div>
          </div>
          <div v-for="(task, index) in TasksData" class="_task">
            <div class="_taskSpan">
              <div class="kit-icon" v-html="Icon.Gift"></div>
            </div>
            <div class="_taskContext">
              <div class="_taskContextTitle">
                <h4>
                  {{ $t('app.sendGift') }}
                  {{ task.config.SendCount }} 
                  {{ pluralizeGift(
                    $t('app.sendGiftText'),
                    task.config.SendCount, 
                    storeCache.TelegramData.user.language
                  ) }}
                </h4>
              </div>
              <div class="_taskContextTickets">
                <img :src="Image_Ticket" alt="tickets" />
                <p>+{{ task?.rewards?.[0]?.amount }}</p>
              </div>
            </div>

            <div v-if="task.type === 'send_gift'" class="_taskButton">
              <button v-if="(!task.user_status || task.user_status === 'new') && !task.isLoading && !SendGiftTaskCheck(task)" @click="openProfile()" class="count">
                <span>{{ SendGiftTaskButton(task) }}</span>
              </button>
              <button v-if="task.user_status !== 'completed' && SendGiftTaskCheck(task) && !task.isLoading" @click="clickTask(task)" class="claim">
                <span>{{ $t('tickets.taskButtonClaim') }}</span>
              </button>
              <button v-if="task.user_status === 'completed' && !task.isLoading" class="done">
                <span>{{ $t('tickets.taskButtonDone') }}</span>
              </button>
              <button v-if="task.user_status === 'in_progress' || task.isLoading" class="process">
                <Lottie
                  class="lt"
                  slug="loading-spin"
                  :loop="true"
                  width="25"
                  height="25"
                  renderer="svg"
                />
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
import { fireCircle } from '@/utils/useConfetti';
import { pluralizeGift } from '@/utils/useGift';

import * as balanceApi from '@/api/balanceApi';
import * as taskApi from '@/api/taskApi';

import Lottie from '@/components/Lottie.vue';

import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_TicketImage from '@/assets/images/tickets-image.png';

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

    learnMore() {
      const link = import.meta.env.VITE_APP_MEMTICKETS;
      TelegramModule.useLink(link);
    },

    SendGiftTaskCheck(task) {
      if (!task.rewards) return false;
      return this.storeCache.UserData.sent_user >= task.rewards[0].amount
    },

    SendGiftTaskButton(task) {
      if (!task.rewards) return false;
      return `${Math.max(
        0, 
        Math.min(
          this.storeCache.UserData.sent_user,
          task.rewards[0].amount
        )
      )} / ${task.rewards[0].amount}`;
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
        fireCircle();

        if (task.rewards[0].type === 'tickets') {
          this.storeCache.UserData.user.Tickets += response.awarded;
        };
      }
    },
  },
};
</script>