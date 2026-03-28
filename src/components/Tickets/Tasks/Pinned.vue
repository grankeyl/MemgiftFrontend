<template>
  <div class="_direction _comp _item _tasksPinned" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_row">
            <div class="_card-skel"></div>
            <div class="_card-skel"></div>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_head">
          <h4>{{ $t('tickets.pinnedTitle') }}</h4>
          <span class="_done-count" v-if="completedCount > 0">{{ completedCount }}/{{ totalCount }}</span>
        </div>
        <div 
          v-if="TasksData"
          class="_row"
          :class="{ disabled: !storeCache.TelegramData.user.is_premium }"
        >
            <div 
              v-for="(task, index) in TasksData"
              :key="index"
              @click="clickTask(task)"
              class="_card"
              :class="{ _done: task.user_status === 'completed' }"
            >
              <div class="_card-icon" :class="{ _done: task.user_status === 'completed' }">
                <svg v-if="task.user_status === 'completed'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                <div v-else-if="task.type === 'create_story'" class="kit-icon" v-html="Icon.Photo"></div>
                <div v-else-if="task.type === 'set_emoji'" class="kit-icon" v-html="Icon.Love"></div>
              </div>
              <div class="_card-title">
                <h4>{{ taskName(task.type) }}</h4>
              </div>
              <div v-if="task.user_status !== 'completed'" class="_card-reward">
                <img :src="Image_Ticket" alt="tickets" />
                <p>+{{ task?.rewards?.[0]?.amount }}</p>
              </div>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '@/hooks/useTelegram';

import { useCacheStore } from '@/stores/pinia/piniaStore';
import { taskName } from '@/utils/useTask';
import { Icon } from '@/components/Icon';

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

      taskName,

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
    },
    completedCount() {
      if (!this.TasksData) return 0;
      return this.TasksData.filter(t => t.user_status === 'completed').length;
    },
    totalCount() {
      return this.TasksData ? this.TasksData.length : 0;
    },
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

    async useTask(task) {
      if (task.status === 'completed') return;
      const createTask = await taskApi.use(task.id);
      if (createTask) {
        task.user_status = createTask.status;
        return true;
      }
      return false;
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

    async clickTask(task) {
      if (task.status === 'completed') {
        if (task.type === 'create_story') {
          const storyMedia = task.config.StoryMedia;
          TelegramModule.useShareStory(storyMedia);
        }

        if (task.type === 'set_emoji') {
          const emojiIds = task.config.EmojiIds;
          const randomEmoji = emojiIds[Math.floor(Math.random() * emojiIds.length)];
          TelegramModule.useSetEmoji(randomEmoji);
        }

        return;
      }

      if (task.type === 'create_story') {
        const storyMedia = task.config.StoryMedia;
        TelegramModule.useShareStory(storyMedia)
          .then(async (status) => {
            if (status) {
              this.useTask(task);
              setTimeout(async () => {
                this.claimTask(task);
              }, 6440);
            }
          })
          .catch(() => {
            task.isDone = false;
          });
      }

      if (task.type === 'set_emoji') {
        const emojiIds = task.config.EmojiIds;
        const randomEmoji = emojiIds[Math.floor(Math.random() * emojiIds.length)];
        TelegramModule.useSetEmoji(randomEmoji)
          .then(async () => {
            const use = await this.useTask(task);
            if (use) {
              this.claimTask(task);
            }
          })
          .catch(() => {
            task.isDone = false;
          });
      }
    }
  },
};
</script>
