<template>
  <div ref="filtersEl" class="_filters" :class="containerClasses">
    <div v-if="isLoading" class="_skeleton">
      <div class="_pill-skel"></div>
      <div class="_pill-skel"></div>
      <div class="_pill-skel _short"></div>
    </div>
    <div v-else class="_content">
      <div class="_filters-top">
        <div class="_pills-wrap">
          <button class="_filter-pill" :class="{ _open: selectRarityOpened }" @click="toggleSelectRarityDropdown">
            <span>{{ selectedRarityLabel }}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button class="_filter-pill" :class="{ _open: selectSortbyOpened }" @click="toggleSelectSortbyDropdown">
            <span>{{ selectedSortbyLabel }}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <div class="_filter-dropdown" :class="{ _visible: selectRarityOpened }">
          <div
            v-for="option in selectRarityOptions"
            :key="option.value"
            class="_filter-option"
            :class="{ _selected: option.value === selectRarityValue }"
            @click.stop="selectRarityOption(option)"
          >
            <span>{{ option.label }}</span>
            <svg v-if="option.value === selectRarityValue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        </div>

        <div class="_filter-dropdown" :class="{ _visible: selectSortbyOpened }">
          <div
            v-for="option in selectSortbyOptions"
            :key="option.value"
            class="_filter-option"
            :class="{ _selected: option.value === selectSortbyValue }"
            @click.stop="selectSortbyOption(option)"
          >
            <span>{{ option.label }}</span>
            <svg v-if="option.value === selectSortbyValue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        </div>
      </div>

      <div class="_checkbox" @click="toggleHideSoldOut">
        <div class="_checkbox-box" :class="{ _checked: checkboxHideSoldOut }"></div>
        <span class="_checkbox-label">{{ $t('home.hideGifts') }}</span>
      </div>
    </div>
  </div>

  <div ref="giftsContainer" :class="['_direction', '_comp', '_item', '_gifts', '_lefting', Key]">
    <div v-if="isLoading || isEmptyStore" class="_skeleton">
      <div class="_gift"></div>
      <div class="_gift"></div>
      <div class="_gift"></div>
      <div class="_gift"></div>
    </div>
    <div v-else class="_content _anim-stagger">
      <div 
        v-for="(gift, index) in otherGifts" 
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
            <p>{{ checkPriceNumber(gift.Price) }}</p>
            <img class="starsSmall" :src="Image_starsPng" alt="stars" />
          </button>
          <button v-else>
            <p>{{ $t('app.price_free') }}</p>
          </button>
        </div>
        
        <div v-if="gift.Locked" class="_buy locked">
          <button>
            <p>Locked</p>
            <div class="kit-icon" v-html="Icon.Lock"></div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="!isLoading && filteredNfts.length === 0" class="_direction _comp _item _nftNull _lefting">
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
          <button @click="resetFilters">
            <p>{{ $t('home.nullGiftsButton') }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { toRaw } from 'vue';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkRarityImage, checkRarity, checkPriceNumber } from '../../utils/useGift';
import { Icon } from '../Icon';

import * as nftApi from '../../api/nftApi';

import TelegramModule from '../../hooks/useTelegram';

import Image_giftBg from '@/assets/gifts/png/gift_bg.png';
import Image_starsPng from '@/assets/images/stars.png';
import Image_TicketSodaSvg from '@/assets/images/soda-ticket.svg';

import Button from '../Button.vue';


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
  },

  data() {
    return {
      storeCache: useCacheStore(),
      storeNftsApp: {},

      isLoading: this.$props.Skeleton,
      activeCategory: 'all',

      selectRarityOpened: false,
      selectRarityValue: 'all',
      selectRarityOptions: [
        { value: 'all', label: this.$t('home.category_1') },
        { value: 'rare', label: this.$t('home.category_3') },
        { value: 'veryrare', label: this.$t('home.category_4') },
        { value: 'epic', label: this.$t('home.category_5') },
        { value: 'legend', label: this.$t('home.category_6') },
        { value: 'author', label: this.$t('home.category_8') },
        { value: 'soldout', label: this.$t('home.category_7') },
      ],

      selectSortbyOpened: false,
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

      sodaEvent: {},

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
    otherGifts() {
      return this.filteredNfts;
    },

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
    containerClasses() {
      return ['_direction', '_comp', '_item', '_filters', '_lefting'];
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
          this.checkboxHideSoldOut = false;
          filtered = filtered.filter((nft) => nft.nftSupplyUsers >= nft.nftSupply);
        } else if (this.activeCategory !== 'all') {
          filtered = filtered.filter(
            (nft) => (nft.Rarity || '').toLowerCase() === this.activeCategory.toLowerCase()
          );
        }
      }

      if (this.checkboxHideSoldOut) {
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
    this.getSodaEvent();

    this.$watch(() => this.storeCache.NftsApp, () => {
      this.storeNftsApp = this.storeCache.NftsApp;
      this.loadResources();
      this.getSodaEvent();
    });

    document.addEventListener('click', this._onClickOutside);
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
          img.src = gift.nftImages.imageMain;
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

    toggleSelectRarityDropdown() {
      this.selectRarityOpened = !this.selectRarityOpened;
      this.selectSortbyOpened = false;
    },

    selectRarityOption(option) {
      this.selectRarityValue = option.value;
      this.activeCategory = option.value === 'all_gifts' ? 'all' : option.value;
      this.selectRarityOpened = false;
      this.saveFiltersToLocalStorage();
    },

    _onClickOutside(e) {
      const el = this.$refs.filtersEl;
      if (el && !el.contains(e.target)) {
        this.selectRarityOpened = false;
        this.selectSortbyOpened = false;
      }
    },

    toggleSelectSortbyDropdown() {
      this.selectSortbyOpened = !this.selectSortbyOpened;
      this.selectRarityOpened = false;
    },

    selectSortbyOption(option) {
      this.selectSortbyValue = option.value;
      this.selectSortbyOpened = false;
      this.selectRarityOpened = false;
      this.saveFiltersToLocalStorage();
    },

    toggleHideSoldOut() {
      this.checkboxHideSoldOut = !this.checkboxHideSoldOut;
      this.saveFiltersToLocalStorage();
    },

    resetFilters() {
      this.selectRarityValue = 'all';
      this.selectSortbyValue = 'old';
      this.activeCategory = 'all';
      this.selectRarityOpened = false;
      this.selectSortbyOpened = false;
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
      const filters = JSON.parse(localStorage.getItem('giftFilters'));
      if (filters) {
        this.selectRarityValue = filters.selectRarityValue || 'all';
        this.selectSortbyValue = filters.selectSortbyValue || 'old';
        this.checkboxHideSoldOut = filters.checkboxHideSoldOut !== false;
        this.activeCategory = this.selectRarityValue === 'all_gifts' ? 'all' : this.selectRarityValue;
      }
    },

    async getSodaEvent() {
      const sodaEvent = await nftApi.sodaEvent();
      if (!sodaEvent) return;

      this.sodaEvent = sodaEvent;
    },

    openSodaEvent() {
      this.$router.push({ name: 'soda' });
    },
  },

  beforeUnmount() {
    document.removeEventListener('click', this._onClickOutside);
  },
};
</script>