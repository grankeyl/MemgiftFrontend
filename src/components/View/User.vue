<template>
  <div class="_direction _comp _item _user" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_image"></div>
          <div class="_name"></div>
          <div class="_descr"></div>
      </div>
      <div v-else class="_content">
          <div class="_image">
            <div
              v-if="UserImage && UserAvatar"
              class="_image_img" 
              :class="{ _loading: UserAvatarLoading }"
            >
              <img 
                @load="UserAvatarLoading = false"
                @error="UserAvatar = false"
                :src="UserImage"
                alt="avatar"
              />
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </div>
            <div v-else class="_image_img">
              <div class="_image_avatar_null">
                <h4 v-if="UserName && UserName.trim()">{{ UserName }}</h4>
                <h4 v-else>No Name</h4>
              </div>
            </div>
            <div class="_image_mark" @click="copyUserId()">
              <span>{{ UserId }}</span>
              <Icon class="kit-icon" v-html="Icon.Copy"></Icon>
            </div>
          </div>
          <div class="_name">
            <h4 v-if="UserName && UserName.trim()">{{ UserName }}</h4>
            <h4 v-else>No Name</h4>
          </div>
          <div class="_descr">
            <p>{{ UserNftsCount }} {{ $t('view.viewGiftsCount') }}</p>
          </div>
      </div>
  </div>
</template>

<script>
import { copyToClipboard } from '../../utils/copyToClipboard';
import { showToast } from '../../utils/toastManager';
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';
import Image_Avatar from '@/assets/images/avatar.png';

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
    UserImage: {
      type: String,
      required: true,
    },
    UserName: {
      type: String,
      required: true,
    },
    UserNftsCount: {
      type: Number,
      required: true,
    },
    UserRank: {
      type: Number,
      required: true,
    },
    UserId: {
      type: Number,
      required: true,
    }
  },

  components: {
    Lottie,
  },

  data() {
    return {
      isLoading: this.$props.Skeleton,

      UserAvatarLoading: true,
      UserAvatar: true,

      Icon,
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

    copyUserId() {
      copyToClipboard(this.$props.UserId);
      showToast('User ID copied', 'success');
    }
  },
};
</script>