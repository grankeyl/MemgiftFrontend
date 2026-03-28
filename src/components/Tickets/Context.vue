<template>
  <div class="_direction _comp _item _ticketsContext" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_hero-skel">
          <div class="_num-skel"></div>
          <div class="_label-skel"></div>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_hero">
          <div class="_hero-num">
            <img :src="Image_Ticket" alt="tickets" />
            <span>{{ storeCache.UserData.user.Tickets || 0 }}</span>
          </div>
          <p class="_hero-label">{{ $t('tickets.title') }}</p>
        </div>
      </div>
  </div>
</template>

<script>
import TelegramModule from '../../hooks/useTelegram';
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_TicketImage from '@/assets/images/tickets-image.png';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    completedTasks: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
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
    this.$watch(() => this.storeCache.TelegramData, () => this.getTickets());
  },

  computed: {
    isLoading() { return this.Skeleton },
  },
  
  methods: {
    async getTickets() {
      try { this.storeCache.UserData.user.Tickets = this.storeCache.UserData.user.Tickets || 0 } catch {}
    },
    async loadResources() {
      try {
        await Promise.all([document.fonts.ready, this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch {}
    },
    loadImages() {
      return Promise.all([Image_Avatar, Image_Ticket, Image_TicketImage].map(src =>
        new Promise((resolve, reject) => { const img = new Image(); img.src = src; img.onload = resolve; img.onerror = reject })
      ));
    },
  },
};
</script>
