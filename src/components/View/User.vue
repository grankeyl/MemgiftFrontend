<template>
  <div class="_direction _comp _item _user" :class="Key">
    <div v-if="isLoading" class="_skeleton">
      <div class="pu-ava"></div>
      <div class="_name"></div>
      <div class="_descr"></div>
    </div>
    <div v-else class="_content">
      <div class="pu-ava">
        <div v-if="UserImage && UserAvatar" class="pu-ava__img" :class="{ _loading: UserAvatarLoading }">
          <img @load="UserAvatarLoading = false" @error="UserAvatar = false" :src="UserImage" alt="avatar" />
          <Lottie class="lt" slug="loading-spin" :loop="true" width="75" height="75" renderer="svg" />
        </div>
        <div v-else class="pu-ava__img">
          <div class="pu-ava__null">
            <h4 v-if="UserName">{{ UserName[0] }}</h4>
            <h4 v-else>?</h4>
          </div>
        </div>
      </div>

      <h2 class="pu-name">{{ UserName || 'No Name' }}</h2>

      <div class="pu-meta">
        <span v-if="UserRank" class="pu-meta__rank">#{{ UserRank }}</span>
        <span v-if="UserRank" class="pu-meta__dot">·</span>
        <span class="pu-meta__gifts">{{ UserNftsCount }} {{ $t('view.viewGiftsCount') }}</span>
        <span v-if="UserTld" class="pu-meta__dot">·</span>
        <span v-if="UserTld" class="pu-meta__id" @click="copyUserId()">
          {{ UserTld }}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2.5"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2.5"/>
          </svg>
        </span>
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
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    UserImage: { type: String, required: true },
    UserName: { type: String, required: true },
    UserNftsCount: { type: Number, required: true },
    UserRank: { type: Number, required: true },
    UserTld: { type: [Number, String], required: false, default: null },
  },
  components: { Lottie },
  data() {
    return {
      isLoading: this.Skeleton,
      UserAvatarLoading: true,
      UserAvatar: true,
      Icon,
    };
  },
  mounted() { this.loadResources(); },
  computed: {
    isLoading() { return this.Skeleton; },
  },
  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch (e) { console.error(e); }
    },
    loadFonts() { return document.fonts.ready; },
    loadImages() {
      return Promise.all([Image_Avatar].map(src => new Promise((res, rej) => {
        const img = new Image(); img.src = src; img.onload = res; img.onerror = rej;
      })));
    },
    copyUserId() {
      copyToClipboard(this.UserTld);
      showToast('User ID copied', 'success');
    }
  }
};
</script>

<style lang="sass" scoped>
.pu-meta
  &__source
    height: 22px
    display: inline-flex
    align-items: center
    padding: 0 10px
    border-radius: 99em
    background: rgba(59, 130, 246, 0.12)
    color: #7BA4FF
    font-size: 12px
    font-weight: 700
    white-space: nowrap

  &__dot
    flex-shrink: 0
</style>
