<template>
  <div class="_direction _comp _item _ticketsContext" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_block">
          <div class="_image"></div>
          <div class="_title"></div>
          <div class="_descr"></div>
          <div class="_tickets"></div>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_block">
          <div class="_image">
            <img :src="Image_TicketImage" />
          </div>
          <div class="_title">
            <h4>{{ $t('tickets.title') }}</h4>
          </div>
          <div class="_descr">
            {{ $t('tickets.description') }} <br>
            <span @click="learnMore()">{{ $t('tickets.descriptionSpan') }}</span>
          </div>
          <div class="_tickets">
            <img :src="Image_Ticket" alt="tickets" />
            <p>{{ storeCache.UserData.user.Tickets || 0 }}</p>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '../../hooks/useTelegram';

import { useCacheStore } from '../../stores/pinia/piniaStore';

import Lottie from '../Lottie.vue';

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
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,

      Image_Ticket,
      Image_TicketImage,
    };
  },

  mounted() {
    this.loadResources();
    this.getTickets();

    this.$watch(() => this.storeCache.TelegramData, () => {
      this.getTickets();
    });
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
  },
  
  methods: {
    async getTickets() {
      try {
        this.storeCache.UserData.user.Tickets = this.storeCache.UserData.user.Tickets || 0;
      } catch {}
    },

    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
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
    }
  },
};
</script>