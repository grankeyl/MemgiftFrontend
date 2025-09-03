<template>
  <div class="_direction _comp _item _recents _ticketsRecents" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_items">
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
          </div>
      </div>
      <div v-else class="_content">
          <div class="_items">
            <div 
              v-if="!HistoryList || HistoryList.length > 0"
              v-for="recent in HistoryList"
              class="_item"
            >
              <div class="_avatar">
                <img
                  v-if="recent.user_photo"
                  @load="recent.user_photo"
                  @error="recent.user_photo = false"
                  :src="recent.user_photo"
                />
                <div v-else class="_avatar_null">
                  <h4>{{ recent.user_full_name[0] }}</h4>
                </div>
              </div>
              <div class="_context">
                <div class="_title">
                  <h4>
                    <span>{{ cleanString(recent.user_full_name).trim() }}</span>
                    <b v-if="recent.action == 'sended'">{{ $t('tickets.recentsAction1') }}</b>
                  </h4>
                </div>
                <div class="_descr">
                  <p>{{ unixToRelative(recent.timestamp) }}</p>
                </div>
              </div>
              <div class="_price">
                <div class="_image">
                  <img :src="Image_Ticket" />
                </div>
                <div class="_amount">
                  <span>+{{ recent.tickets }}</span>
                </div>
              </div>
            </div>
            <div v-else class="_item _nullRecents">
                <h4>{{ $t('collection.recentsNull') }}</h4>
            </div>
          </div>
      </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { unixToRelative } from '../../utils/useApp';
import { cleanString } from '../../utils/useApp';

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

      HistoryList: {},

      unixToRelative,
      cleanString,

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
  },
  
  methods: {
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
  },
};
</script>