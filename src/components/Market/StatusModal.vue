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
            <div class="kit-icon pen" v-html="Icon.Pen"></div>
            <h4>{{ $t('profile.profileStatusModal.title') }}</h4>
          </div>
          <div @click="closeModal" class="close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>
        <div class="items">
          <div 
            v-for="(item, index) in sortedItems" 
            :key="index"
            @click="applySelect(item.id)"
            class="item"
          >
            <div class="left">
              <h5>{{ $t(`profile.profileStatusModal.items.${item.id}`) }}</h5>
            </div>
            <div class="select" :class="{ active: localSelected === item.id }">
              <div class="circle"></div>
            </div>
          </div>
        </div>
        <div class="buttons">
          <button @click="cancel">
            <h4>{{ $t('profile.profileFilterModal.cancel') }}</h4>
          </button>
          <button @click="apply">
            <h4>{{ $t('profile.profileFilterModal.apply') }}</h4>
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
    ActiveTab: { type: String, required: true },
    SortItems: { type: Array, required: true },
    Selected: { type: Array, default: () => [] },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoadingModalImage: true,
      localSelected: '',

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
      if (val) this.localSelected = this.Selected;
    },
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isSkeleton() {
      return this.Skeleton;
    },
    sortedItems() {
      const list = Array.isArray(this.SortItems)
        ? this.SortItems
        : Object.values(this.SortItems || {});

      if (this.ActiveTab === 'gifts') {
        return list.filter(i => !['sold', 'listed', 'removed'].includes(i.id));
      }
      return list;
    }
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

    applySelect(sort) {
      this.localSelected = sort;
    },

    apply() {
      this.$emit('apply', this.localSelected);
      this.$emit('closeModal');
    },

    cancel() {
      this.closeModal();
    },
  },
};
</script>

<style>
</style>