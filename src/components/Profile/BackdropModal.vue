<template>
  <div 
    class="_direction _comp _item _modelModal"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalActive }"
      >
        <div @click="closeModal" class="close"></div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
        :class="{ hide: !ModalActive }"
      >
        <div class="head">
          <div class="centered">
            <div class="kit-icon" v-html="Icon.Gift"></div>
            <h4>{{ $t('market.backdropModalTitle') }}</h4>
          </div>
          <div @click="closeModal" class="close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>
        <div v-if="showListSkeleton" class="items-skeleton profile-filter-skeleton profile-filter-skeleton--backdrops">
          <div class="items-skeleton__row" v-for="n in 6" :key="'backdrop-skel-' + n">
            <div class="items-skeleton__circle profile-filter-skeleton__circle-backdrop"></div>
            <div class="profile-filter-skeleton__copy">
              <div class="items-skeleton__line" :style="{ width: 42 + n * 6 + '%' }"></div>
              <div class="items-skeleton__line profile-filter-skeleton__line-small" :style="{ width: 20 + n * 4 + '%' }"></div>
            </div>
            <div class="items-skeleton__box"></div>
          </div>
        </div>
        <div v-else class="items">
          <div 
            v-for="(item, index) in GiftsList" 
            :key="index"
            @click="applyModel(item.unique_name)"
            class="item"
          >
            <div
              class="backdrop"
              :style="{
                '--center-color': item.colors_center,
                '--around-color': item.colors_around,
              }"
            ></div>
            <div class="left">
              <h5>{{ item.unique_name }}</h5>
              <span>{{ item.drop_rate }}%</span>
            </div>
            <div class="checkbox" :class="{ active: localSelected.includes(item.unique_name) }">
              <div class="kit-icon" v-html="Icon.Done"></div>
            </div>
          </div>
        </div>
        <div class="buttons">
          <button @click="cancel">
            <h4>{{ $t('profile.profileModelModal.cancel') }}</h4>
          </button>
          <button @click="apply" :disabled="showListSkeleton">
            <h4>{{ $t('profile.profileModelModal.apply') }}</h4>
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    GiftsList: { type: Array, required: true },
    Selected: { type: Array, default: () => [] },
    ListLoading: { type: Boolean, default: false },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.Skeleton,
      isLoadingModalImage: true,
      localSelected: [],

      OwnerImage: true,
      ActiveButton: false,
      
      Icon,

      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,
    };
  },

  watch: {
    ModalActive(val) {
      if (val) this.localSelected = [...this.Selected];
    },
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isSkeleton() {
      return this.Skeleton;
    },
    showListSkeleton() {
      return this.ModalActive && this.ListLoading;
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
        Image_Stars
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

    closeModal() {
      this.$emit('closeModal');
    },

    applyModel(model) {
      const i = this.localSelected.indexOf(model);
      if (i !== -1) this.localSelected.splice(i, 1);
      else this.localSelected.push(model);
    },

    apply() {
      this.$emit('apply', [...this.localSelected]);
      this.$emit('closeModal');
    },

    cancel() {
      this.closeModal();
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./ModelModal.sass"

.item
  justify-content: start !important

  .backdrop
    width: 30px
    height: 30px
    border-radius: 20px
    background: radial-gradient(circle, var(--center-color), var(--around-color))
  
  .checkbox
    margin-left: auto
</style>
