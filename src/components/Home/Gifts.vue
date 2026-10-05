<template>
  <div class="overlay" :class="{ 'is-open is-dark': rarityModalActive }" @click="rarityModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': sortModalActive }" @click="sortModalActive = false" />

  <SelectModal
    :ModalActive="rarityModalActive"
    :Title="$t('home.category_1')"
    :IconHtml="Icon.Gift"
    :Items="rarityItems"
    :Selected="selectRarityValue"
    @closeModal="rarityModalActive = false"
    @apply="applyRarity"
  />

  <SelectModal
    :ModalActive="sortModalActive"
    :Title="$t('profile.profileFilterModal.title')"
    :IconHtml="Icon.Sort"
    :Items="sortItems"
    :Selected="selectSortbyValue"
    @closeModal="sortModalActive = false"
    @apply="applySort"
  />

  <!-- One root block so home ._view gap doesn't separate filters and gifts -->
  <div class="home-gifts-block _lefting">
    <div ref="filtersEl" class="_filters" :class="containerClasses">
      <div v-if="isLoading" class="_skeleton">
        <div class="_pill-skel"></div>
        <div class="_pill-skel"></div>
        <div class="_pill-skel _short"></div>
      </div>
      <div v-else class="_content">
        <div class="_filters-top">
          <div class="_pills-wrap">
            <button type="button" class="_filter-pill" @click="openRarityModal">
              <span>{{ selectedRarityLabel }}</span>
              <div class="border"></div>
              <Icon class="kit-icon" v-html="Icon.Gift"></Icon>
            </button>
            <button type="button" class="_filter-pill" @click="openSortModal">
              <span>{{ selectedSortbyLabel }}</span>
              <div class="border"></div>
              <Icon class="kit-icon sort" v-html="Icon.Sort"></Icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading || isEmptyStore || filteredNfts.length > 0"
      ref="giftsContainer"
      :class="['_direction', '_comp', '_item', '_gifts', Key]"
    >
      <div v-if="isLoading || isEmptyStore" class="_skeleton">
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
      </div>
      <div v-else class="_content _anim-stagger">
        <div
          v-for="(gift, index) in filteredNfts"
          :key="gift.UKey"
          @click="openCollection(gift.UKey)"
          class="_gift _anim-press"
          :class="{
            [gift.Rarity]: true,
            ['giftNew_' + gift.New]: true
          }"
        >
          <div v-if="gift.New" class="nftNewMark">
            <p>{{ $t('home.giftNew') }}</p>
          </div>
          <div class="_symbols">
            <img :src="Image_giftBg" />
          </div>
          <div v-if="gift.soldOut" class="_rarity">
            <div class="_image">
              <img :src="checkRarityImage('soldout')" />
            </div>
            <div class="_text">
              <span>{{ checkRarity('soldout') }}</span>
            </div>
          </div>
          <div v-else class="_rarity">
            <div class="_image">
              <img :src="checkRarityImage(gift.Rarity)" />
            </div>
            <div class="_text">
              <span>{{ checkRarity(gift.Rarity) }}</span>
            </div>
          </div>

          <div class="_nft" :class="{ nftLoading: gift.nftOnLoading }">
            <img
              @load="giftOnLoad(gift)"
              @error="giftOnError(gift)"
              :src="gift.ImageMain"
              v-bind:class="{ nftLoading: gift.nftOnLoading }"
              loading="lazy"
            />
            <div class="loader-icon" :class="{ active: gift.nftOnLoading }"></div>
          </div>

          <div v-if="!gift.Locked" class="_buy">
            <button v-if="gift.Price">
              <img class="starsSmall" :src="Image_starsPng" alt="stars" />
              <p>{{ checkPriceNumber(gift.Price) }}</p>
            </button>
            <button v-else>
              <p>{{ $t('app.price_free') }}</p>
            </button>
          </div>

          <div v-if="gift.Locked" class="_buy locked">
            <button>
              <div class="kit-icon" v-html="Icon.Lock"></div>
              <p>{{ $t('app.locked') }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && !isEmptyStore && filteredNfts.length === 0" class="_direction _comp _item _nftNull">
      <div class="_null">
        <div class="_left">
          <div class="_title">
            <h4>{{ $t('home.nullGiftsTitle') }}</h4>
          </div>
          <div class="_descr">
            <p>{{ $t('home.nullGiftsDescr') }}</p>
          </div>
        </div>
        <div class="_right">
          <div class="_null_buy">
            <button type="button" @click="resetFilters">
              <p>{{ $t('home.nullGiftsButton') }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkRarityImage, checkRarity, checkPriceNumber } from '../../utils/useGift';
import { Icon } from '../Icon';

import TelegramModule from '../../hooks/useTelegram';

import Image_giftBg from '@/assets/gifts/png/gift_bg.png';
import Image_starsPng from '@/assets/images/stars.png';
import Image_TicketSodaSvg from '@/assets/images/soda-ticket.svg';

import Button from '../Button.vue';
import SelectModal from './SelectModal.vue';

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
    Key: {
      type: String,
      required: false,
    }
  },

  components: {
    Button,
    SelectModal,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      storeNftsApp: {},

      isLoading: this.$props.Skeleton,
      activeCategory: 'all',

      rarityModalActive: false,
      sortModalActive: false,

      selectRarityValue: 'all',
      selectRarityOptions: [
        { value: 'all', label: this.$t('home.category_1') },
        { value: 'new', label: this.$t('home.category_2') },
        { value: 'rare', label: this.$t('home.category_3') },
        { value: 'veryrare', label: this.$t('home.category_4') },
        { value: 'epic', label: this.$t('home.category_5') },
        { value: 'legend', label: this.$t('home.category_6') },
        { value: 'author', label: this.$t('home.category_8') },
        { value: 'soldout', label: this.$t('home.category_7') },
      ],

      selectSortbyValue: 'new',
      selectSortbyOptions: [
        { value: 'new', label: this.$t('home.sortby_1') },
        { value: 'old', label: this.$t('home.sortby_2') },
        { value: 'rarity', label: this.$t('home.sortby_3') },
        { value: 'price_high_to_low', label: this.$t('home.sortby_4') },
        { value: 'price_low_to_high', label: this.$t('home.sortby_5') },
        { value: 'supply_high_to_low', label: this.$t('home.sortby_6') },
        { value: 'supply_low_to_high', label: this.$t('home.sortby_7') },
      ],

      checkboxHideSoldOut: true,

      checkRarityImage,
      checkRarity,
      checkPriceNumber,

      Icon,
      Image_giftBg,
      Image_starsPng,
      Image_TicketSodaSvg,
    };
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    isEmptyStore() {
      return !this.storeNftsApp || Object.entries(this.storeNftsApp).length === 0
    },
    selectedRarityLabel() {
      const found = this.selectRarityOptions.find(opt => opt.value === this.selectRarityValue);
      return found ? found.label : '';
    },
    selectedSortbyLabel() {
      const found = this.selectSortbyOptions.find(opt => opt.value === this.selectSortbyValue);
      return found ? found.label : '';
    },
    rarityItems() {
      return this.selectRarityOptions.map(o => ({ id: o.value, label: o.label }));
    },
    sortItems() {
      return this.selectSortbyOptions.map(o => ({ id: o.value, label: o.label }));
    },
    containerClasses() {
      return ['_direction', '_comp', '_item', '_filters'];
    },
    nftArray() {
      return Array.isArray(this.storeNftsApp) ? this.storeNftsApp : Object.values(this.storeNftsApp || {});
    },
    filteredNfts() {
      let filtered = this.nftArray;

      const validCategories = ['legend', 'epic', 'veryrare', 'rare', 'soldout', 'new', 'all', 'author'];

      if (validCategories.includes(this.activeCategory)) {
        if (this.activeCategory === 'new') {
          filtered = filtered.filter((nft) => nft.New === true);
        } else if (this.activeCategory === 'soldout') {
          filtered = filtered.filter((nft) => nft.nftSupplyUsers >= nft.nftSupply || nft.soldOut);
        } else if (this.activeCategory !== 'all') {
          filtered = filtered.filter(
            (nft) => (nft.Rarity || '').toLowerCase() === this.activeCategory.toLowerCase()
          );
        }
      }

      if (this.checkboxHideSoldOut && this.activeCategory !== 'soldout') {
        filtered = filtered.filter((nft) => !nft.soldOut);
      }

      const sortType = this.selectSortbyValue;

      if (sortType === 'rarity') {
        const freeNfts = filtered.filter((nft) => (nft.Price || 0) === 0);
        const authorNfts = filtered.filter((nft) => (nft.Rarity || '').toLowerCase() === 'author');
        const otherNfts = filtered.filter((nft) => (nft.Rarity || '').toLowerCase() !== 'author' && (nft.Price || 0) !== 0);
        return [...freeNfts, ...authorNfts, ...otherNfts];
      }

      if (sortType === 'new') {
        return [...filtered].sort((a, b) => b.ID - a.ID);
      }
      if (sortType === 'old') {
        return [...filtered].sort((a, b) => a.ID - b.ID);
      }
      if (sortType === 'price_high_to_low') {
        return [...filtered].sort((a, b) => (Number(b.Price) || 0) - (Number(a.Price) || 0));
      }
      if (sortType === 'price_low_to_high') {
        return [...filtered].sort((a, b) => (Number(a.Price) || 0) - (Number(b.Price) || 0));
      }
      if (sortType === 'supply_high_to_low') {
        return [...filtered].sort((a, b) => (b.nftSupplyUsers || 0) - (a.nftSupplyUsers || 0));
      }
      if (sortType === 'supply_low_to_high') {
        return [...filtered].sort((a, b) => (a.nftSupplyUsers || 0) - (b.nftSupplyUsers || 0));
      }

      return filtered;
    }
  },

  mounted() {
    this.loadFiltersFromLocalStorage();
    this.storeNftsApp = this.storeCache.NftsApp;
    this.loadResources();

    this.$watch(() => this.storeCache.NftsApp, () => {
      this.storeNftsApp = this.storeCache.NftsApp;
      this.loadResources();
    });
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.$emit('loadSuccess');
      } catch (error) {
        this.$emit('loadError', error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const imagePromises = this.nftArray.map((gift) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = gift.nftImages?.imageMain || gift.ImageMain;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      const staticImages = [Image_giftBg, Image_starsPng].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.allSettled([...imagePromises, ...staticImages]);
    },

    openCollection(UKey) {
      TelegramModule.useSoftHaptic();
      this.$router.push({
        name: 'collection',
        params: { nft: UKey }
      });
    },

    giftOnLoad(gift) {
      gift.nftOnLoading = false;
    },

    giftOnError(gift) {
      gift.nftOnLoading = true;
    },

    openRarityModal() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.sortModalActive = false;
      this.rarityModalActive = true;
    },

    openSortModal() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.rarityModalActive = false;
      this.sortModalActive = true;
    },

    applyRarity(value) {
      this.selectRarityValue = value;
      this.activeCategory = value === 'all_gifts' ? 'all' : value;
      if (value !== 'soldout') {
        this.checkboxHideSoldOut = true;
      }
      this.saveFiltersToLocalStorage();
    },

    applySort(value) {
      this.selectSortbyValue = value;
      this.saveFiltersToLocalStorage();
    },

    resetFilters() {
      this.selectRarityValue = 'all';
      this.selectSortbyValue = 'new';
      this.activeCategory = 'all';
      this.rarityModalActive = false;
      this.sortModalActive = false;
      this.checkboxHideSoldOut = true;
      this.saveFiltersToLocalStorage();
    },

    saveFiltersToLocalStorage() {
      const filters = {
        selectRarityValue: this.selectRarityValue,
        selectSortbyValue: this.selectSortbyValue,
        checkboxHideSoldOut: this.checkboxHideSoldOut
      };
      localStorage.setItem('giftFilters', JSON.stringify(filters));
    },

    loadFiltersFromLocalStorage() {
      try {
        const filters = JSON.parse(localStorage.getItem('giftFilters'));
        if (filters) {
          this.selectRarityValue = filters.selectRarityValue || 'all';
          this.selectSortbyValue = filters.selectSortbyValue || 'new';
          this.checkboxHideSoldOut = filters.checkboxHideSoldOut !== false;
          this.activeCategory = this.selectRarityValue === 'all_gifts' ? 'all' : this.selectRarityValue;
        }
      } catch {}
    },
  },
};
</script>
