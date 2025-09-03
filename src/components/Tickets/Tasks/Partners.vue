<template>
  <div class="_direction _comp _item _partnersTasks" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_block">
        </div>
      </div>
      <div v-else class="_content">
        <div class="_block">
          
          <div class="_blockHead">
            <div class="_blockHeadTitle">
              <h4>{{ $t('tickets.partnersTitle') }}</h4>
            </div>
            <div @click="becomePartner()" class="_blockHeadSpan">
              <span>{{ $t('tickets.partnersSpan') }}</span>
              <div class="kit-icon" v-html="Icon.ChevroneRight"></div>
            </div>
          </div>

          <div v-for="(task, index) in TasksData" class="_tasksBlocker" :key="index">
            <div v-if="task.type === 'subscribe_channel'" class="_task">
              <div class="_taskSpan">
                <img :src="task.config.ChannelAvatar" alt="partners" />
              </div>
              <div class="_taskContext">
                <div class="_taskContextTitle">
                  <h4>{{ task.config.ChannelName }}</h4>
                </div>
                <div class="_taskContextTickets">
                  <img :src="Image_Ticket" alt="tickets" />
                  <p>+{{ task?.rewards?.[0]?.amount }}</p>
                </div>
              </div>
              <div class="_taskButton">
                <button v-if="(!task.user_status || task.user_status === 'new') && !task.isLoading" @click="clickTask(task)" class="start">
                  <span>{{ $t('tickets.taskButtonStart') }}</span>
                </button>
                <button v-if="task.user_status === 'in_review' && !task.isLoading" @click="claimTask(task)" class="claim">
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
            <div v-if="task.type === 'join_mini_app'" class="_task">
              <div class="_taskSpan">
                <img :src="task.config.MiniAppAvatar" alt="partners" />
              </div>
              <div v-if="task.rewards && task.rewards[0].type === 'gifts'" class="_taskContext">
                <div class="_taskContextTitle">
                  <h4>{{ task.config.MiniAppName }}</h4>
                </div>
                <div class="_taskContextTickets">
                  <b>{{ $t('tickets.stickerGift', { count: 1 }) }}</b>
                </div>
              </div>
              <div v-if="task.rewards && task.rewards[0].type === 'tickets'" class="_taskContext">
                <div class="_taskContextTitle">
                  <h4>{{ task.config.MiniAppName }}</h4>
                </div>
                <div class="_taskContextTickets">
                  <img :src="Image_Ticket" alt="tickets" />
                  <p>+{{ task?.rewards?.[0]?.amount }}</p>
                </div>
              </div>
              <div class="_taskButton">
                <button v-if="(!task.user_status || task.user_status === 'new') && !task.isLoading" @click="clickTask(task)" class="start">
                  <span>{{ $t('tickets.taskButtonStart') }}</span>
                </button>
                <button v-if="task.user_status === 'in_review' && !task.isLoading" @click="claimTask(task)" class="claim">
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
  </div>
</template>

<script>
import TelegramModule from '@/hooks/useTelegram';

import { Icon } from '@/components/Icon';
import { useCacheStore } from '@/stores/pinia/piniaStore';
import { fireCircle } from '@/utils/useConfetti';

import * as nftApi from '@/api/nftApi';
import * as telegramApi from '@/api/telegramApi';
import * as taskApi from '@/api/taskApi';

import Lottie from '@/components/Lottie.vue';
import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_TicketImage from '@/assets/images/tickets-image.png';
import Image_Cap from '@/assets/gifts/nft_best_cap.svg';

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

      Icon,
      Image_Ticket,
      Image_TicketImage,
      Image_Cap,
    };
  },

  mounted() {
    this.loadResources();

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
          fireCircle();

          if (createTask.status === 'done') {
            this.storeCache.UserData.Tickets += createTask.tickets;
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
        fireCircle();

        if (task.rewards[0].type === 'tickets') {
          this.storeCache.UserData.user.Tickets += response.awarded;
        };
      }
    },

    becomePartner() {
      TelegramModule.useLink(import.meta.env.VITE_APP_MINI_APP_SUPPORT);
    },
  },
};
</script>