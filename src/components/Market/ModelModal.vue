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
        <div class="modal-skel__handle"></div>
        <div class="modal-skel__head"></div>
        <div class="modal-skel__item" v-for="n in 5" :key="'sk-' + n">
          <div class="modal-skel__circle"></div>
          <div class="modal-skel__text" :style="{ width: 30 + n * 8 + '%' }"></div>
          <div class="modal-skel__check"></div>
        </div>
        <div class="modal-skel__btns"><div></div><div></div></div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
        :class="{ hide: !ModalActive }"
      >
        <div class="head">
          <div class="centered">
            <div class="kit-icon" v-html="Icon.Gift"></div>
            <h4>{{ $t('profile.profileModelModal.title') }}</h4>
          </div>
          <div @click="closeModal" class="close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>
        <div class="modal-search">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('market.searchPlaceholder')" 
          />
          <span v-if="localSelectedModels.length" class="modal-search__count">{{ localSelectedModels.length }}</span>
        </div>
        <div class="items">
          <div 
            v-for="(item, index) in filteredList" 
            :key="index"
            @click="applyModel(item.UKey)"
            class="item"
          >
            <div class="left">
              <img :src="item.ImageMain" alt="">
              <h5>{{ item.Name }}</h5>
            </div>
            <div class="checkbox" :class="{ active: localSelectedModels.includes(item.UKey) }">
              <div class="kit-icon" v-html="Icon.Done"></div>
            </div>
          </div>
        </div>
        <div class="buttons">
          <button @click="cancel">
            <h4>{{ $t('profile.profileModelModal.cancel') }}</h4>
          </button>
          <button @click="apply">
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
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoadingModalImage: true,
      localSelectedModels: [],
      searchQuery: '',

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
      if (val) {
        this.localSelectedModels = [...this.Selected];
        this.searchQuery = '';
      }
    },
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isSkeleton() {
      return this.Skeleton;
    },
    filteredList() {
      const arr = Array.isArray(this.GiftsList) ? this.GiftsList : Object.values(this.GiftsList || {});
      const supported = arr.filter(i => i.UpgradeSupport);
      if (!this.searchQuery) return supported;
      const q = this.searchQuery.toLowerCase();
      return supported.filter(i => (i.Name || '').toLowerCase().includes(q));
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
      const i = this.localSelectedModels.indexOf(model);
      if (i !== -1) this.localSelectedModels.splice(i, 1);
      else this.localSelectedModels.push(model);
    },

    apply() {
      this.$emit('apply', [...this.localSelectedModels]);
      this.$emit('closeModal');
    },

    cancel() {
      this.closeModal();
    },
  },
};
</script>

<style lang="sass" scoped>
.item.deleted
    display: none
</style>