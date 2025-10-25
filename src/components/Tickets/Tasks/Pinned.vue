<template>
  <div class="_direction _comp _item _tasksPinned" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_block">
            <div class="_task"></div>
            <div class="_task"></div>
        </div>
      </div>
      <div v-else class="_content">
        <div 
          v-if="TasksData"
          class="_block"
          :class="{ disabled: !storeCache.TelegramData.user.is_premium }"
        >
            <div 
              v-for="(task, index) in TasksData"
              @click="clickTask(task)"
              class="_task"
            >
              <div class="_taskSpan" :class="{ done: task.user_status === 'completed' }">
                <div class="kit-icon done" v-html="Icon.Done"></div>
                <div v-if="task.user_status !== 'completed' && task.type === 'create_story'"
                class="kit-icon" v-html="Icon.Photo"></div>
                <div v-if="task.user_status !== 'completed' && task.type === 'set_emoji'"
                class="kit-icon" v-html="Icon.Love"></div>
              </div>
              <div class="_taskTitle">
                <h4>{{ taskName(task.type) }}</h4>
              </div>
              <div v-if="task.user_status !== 'completed'" class="_taskTickets">
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
          const shareStory = TelegramModule.useShareStory(storyMedia)
        }

        if (task.type === 'set_emoji') {
          const emojiIds = task.config.EmojiIds;
          const randomEmoji = emojiIds[Math.floor(Math.random() * emojiIds.length)];
          const setEmoji = TelegramModule.useSetEmoji(randomEmoji)
        }

        return;
      }

      if (task.type === 'create_story') {
        const storyMedia = task.config.StoryMedia;
        const shareStory = TelegramModule.useShareStory(storyMedia)
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
        const setEmoji = TelegramModule.useSetEmoji(randomEmoji)
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