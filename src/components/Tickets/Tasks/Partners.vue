<template>
  <div class="_direction _comp _item _partnersTasks" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_list-skel">
          <div class="_row-skel"></div>
          <div class="_row-skel"></div>
          <div class="_row-skel"></div>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_section-head">
          <h4>{{ $t('tickets.partnersTitle') }}</h4>
          <span @click="becomePartner()">
            {{ $t('tickets.partnersSpan') }}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </div>

        <div class="_task-list">
          <!-- ScoobyVPN hardcoded task -->
          <div class="_task-row">
            <div class="_task-avatar">
              <img src="/scooby_vpn.png" alt="ScoobyVPN" />
            </div>
            <div class="_task-info">
              <h4>Scooby VPN</h4>
              <div class="_task-reward">
                <p style="color: rgba(255,255,255,0.5); font-size: 13px;">Активировать подписку в боте</p>
              </div>
            </div>
            <div class="_task-action">
              <button v-if="!scoobyVpnDone && !scoobyVpnLoading" @click="clickScoobyVpn()" class="_btn _start">
                <span>{{ $t('tickets.taskButtonStart') }}</span>
              </button>
              <button v-if="scoobyVpnDone" class="_btn _done">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </button>
              <button v-if="scoobyVpnLoading && !scoobyVpnDone" class="_btn _loading">
                <Lottie class="lt" slug="loading-spin" :loop="true" width="25" height="25" renderer="svg" />
              </button>
            </div>
          </div>

          <div v-for="(task, index) in TasksData" :key="index" class="_task-row">
            <template v-if="task.type === 'subscribe_channel'">
              <div class="_task-avatar">
                <img :src="task.config.ChannelAvatar" alt="" />
              </div>
              <div class="_task-info">
                <h4>{{ task.config.ChannelName }}</h4>
                <div class="_task-reward">
                  <img :src="Image_Ticket" alt="tickets" />
                  <p>+{{ task?.rewards?.[0]?.amount }}</p>
                </div>
              </div>
              <div class="_task-action">
                <button v-if="(!task.user_status || task.user_status === 'new') && !task.isLoading" @click="clickTask(task)" class="_btn _start">
                  <span>{{ $t('tickets.taskButtonStart') }}</span>
                </button>
                <button v-if="task.user_status === 'in_review' && !task.isLoading" @click="claimTask(task)" class="_btn _claim">
                  <span>{{ $t('tickets.taskButtonClaim') }}</span>
                </button>
                <button v-if="task.user_status === 'completed' && !task.isLoading" class="_btn _done">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
                <button v-if="task.user_status === 'in_progress' || task.isLoading" class="_btn _loading">
                  <Lottie class="lt" slug="loading-spin" :loop="true" width="25" height="25" renderer="svg" />
                </button>
              </div>
            </template>

            <template v-if="task.type === 'join_mini_app'">
              <div class="_task-avatar">
                <img :src="task.config.MiniAppAvatar" alt="" />
              </div>
              <div class="_task-info">
                <h4>{{ task.config.MiniAppName }}</h4>
                <div class="_task-reward">
                  <template v-if="task.rewards && task.rewards[0].type === 'gifts'">
                    <b>{{ $t('tickets.stickerGift', { count: 1 }) }}</b>
                  </template>
                  <template v-else>
                    <img :src="Image_Ticket" alt="tickets" />
                    <p>+{{ task?.rewards?.[0]?.amount }}</p>
                  </template>
                </div>
              </div>
              <div class="_task-action">
                <button v-if="(!task.user_status || task.user_status === 'new') && !task.isLoading" @click="clickTask(task)" class="_btn _start">
                  <span>{{ $t('tickets.taskButtonStart') }}</span>
                </button>
                <button v-if="task.user_status === 'in_review' && !task.isLoading" @click="claimTask(task)" class="_btn _claim">
                  <span>{{ $t('tickets.taskButtonClaim') }}</span>
                </button>
                <button v-if="task.user_status === 'completed' && !task.isLoading" class="_btn _done">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
                <button v-if="task.user_status === 'in_progress' || task.isLoading" class="_btn _loading">
                  <Lottie class="lt" slug="loading-spin" :loop="true" width="25" height="25" renderer="svg" />
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '@/hooks/useTelegram';

import { Icon } from '@/components/Icon';
import { useCacheStore } from '@/stores/pinia/piniaStore';

import * as nftApi from '@/api/nftApi';
import * as telegramApi from '@/api/telegramApi';
import * as taskApi from '@/api/taskApi';

import Lottie from '@/components/Lottie.vue';
import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_TicketImage from '@/assets/images/tickets-image.png';
import Image_Cap from '@/assets/gifts/nft_best_cap.svg';
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

      isUseInterval: false,
      useCheckInterval: false,
      useCheckTimeout: false,

      scoobyVpnDone: false,
      scoobyVpnLoading: false,
      scoobyVpnInterval: null,

      Icon,
      Image_Ticket,
      Image_TicketImage,
      Image_Cap,
    };
  },

  mounted() {
    this.loadResources();
    this.checkScoobyVpn();

    if (this.TasksData) {
      this.TasksData.forEach(task => {
        if (task.user_status === 'in_progress') {
          this.startUse(task.id);
        }
      });
    }

    this.$watch(
      () => this.TasksData,
      () => {
        this.TasksData.forEach(task => {
          if (task.user_status === 'in_progress') {
            this.startUse(task);
          }
        });
      }
    );
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

    async useTask_SubscribeChannel(task) {
      if (task.isClaimed && !task.isDone) {
        const isClaimedConst = true;
        const isDoneConst = false;
        const createTask = await taskUserApi.create(
          this.storeCache.TelegramData.user.id,
          task.uuid,
          { 
            isClaimed: isClaimedConst, 
            isDone: isDoneConst
          }
        );

        if (createTask) {
          task.isClaimed = isClaimedConst;
          task.isDone = false;
          TelegramModule.useMediumHaptic();
        }
      }

      if (task.isClaimed && task.isDone) {
        const isClaimedConst = true;
        const isDoneConst = true;
        const createTask = await taskUserApi.create(
          this.storeCache.TelegramData.user.id,
          task.uuid,
          { 
            isClaimed: isClaimedConst, 
            isDone: isDoneConst
          }
        );

        if (createTask) {
          task.isLoading = false;
          task.isClaimed = isClaimedConst;
          task.isDone = isDoneConst;
          TelegramModule.useMediumHaptic();
          shootConfetti();

          if (createTask.status === 'done') {
            this.storeCache.UserData.user.Tickets += createTask.tickets;
          }
        }
      }
    },

    async useTask_JoinMiniApp(task) {
      if (task.isClaimed && !task.isDone) {
        const isClaimedConst = true;
        const isDoneConst = false;
        const createTask = await taskUserApi.create(
          this.storeCache.TelegramData.user.id,
          task.uuid,
          { 
            isClaimed: isClaimedConst, 
            isDone: isDoneConst
          }
        );

        if (createTask) {
          task.isClaimed = isClaimedConst;
          task.isDone = false;
          TelegramModule.useMediumHaptic();
        }
      }

      if (task.isClaimed && task.isDone) {
        const isClaimedConst = true;
        const isDoneConst = true;
        const createTask = await taskUserApi.create(
          this.storeCache.TelegramData.user.id,
          task.uuid,
          { 
            isClaimed: isClaimedConst, 
            isDone: isDoneConst
          }
        );

        if (createTask) {
          task.isLoading = false;
          task.isClaimed = isClaimedConst;
          task.isDone = isDoneConst;
          TelegramModule.useMediumHaptic();

          if (createTask.status === 'done') {
            const nftUniqueKey = task.reward.RewardValue;
            const nftData = this.storeCache.NftsAppData[nftUniqueKey];
            if (!nftData) return;

            const createNftFree = await nftApi.createFree(
              this.storeCache.TelegramData.user.id,
              nftData.nftUniqueKey,
              nftData.nftKey,
              nftData.nftPrice
            );

            if (createNftFree) {
              this.$router.push({
                name: "receive",
                params: {
                  nft: nftData.nftUniqueKey,
                  nftType: "received"
                }
              });
            }
          }
        }
      }
    },

    startUse(Task) {
      return new Promise((resolve) => {
        this.isUseInterval = true;
        this.useCheckInterval = setInterval(async () => {
          Task.isLoading = true;
          const data = await taskApi.getAll();
          const task = data.partners.find(task => task.id === Task.id);

          if (task && task.user_status === 'in_review') {
            Task.user_status = task.user_status;
            Task.isLoading = false;
            this.stopUse();
            resolve(true);
          }
        }, 5000);
      });
    },

    stopUse() {
      if (this.useCheckInterval) clearInterval(this.useCheckInterval);
      if (this.useCheckTimeout) clearTimeout(this.useCheckTimeout);
      this.isUseInterval = false;
    },

    async clickTask(task) {
      if (task.status === 'completed') return;

      if (task.type === 'subscribe_channel') {
        task.isLoading = true;
        TelegramModule.useLink(task.config.ChannelLink);
        const use = await taskApi.use(task.id);
        if (use) {
          this.startUse(task);
        }
      }

      if (task.type === 'join_mini_app') {
        task.isLoading = true;
        TelegramModule.useLink(task.config.MiniAppLink);
        setTimeout(async () => { 
          task.isClaimed = true;

          const use = await taskApi.use(task.id);
          if (use && use.status === 'in_review') {
            task.user_status = use.status;
            task.isLoading = false;
          }
        }, 1680);
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

    async checkScoobyVpn() {
      const data = await nftApi.checkScoobyVpn();
      if (data && data.has_subscription) {
        this.scoobyVpnDone = true;
      }
    },

    clickScoobyVpn() {
      TelegramModule.useLink('https://t.me/ScoobyVpnBot?start=e81566f4');
      this.scoobyVpnLoading = true;
      this.scoobyVpnInterval = setInterval(async () => {
        const data = await nftApi.checkScoobyVpn();
        if (data && data.has_subscription) {
          this.scoobyVpnDone = true;
          this.scoobyVpnLoading = false;
          clearInterval(this.scoobyVpnInterval);
        }
      }, 5000);
    },

    becomePartner() {
      TelegramModule.useLink(import.meta.env.VITE_APP_MINI_APP_SUPPORT);
    },
  },
};
</script>
