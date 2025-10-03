<template>

  <div class="_direction _comp _item _categoriesSelected">
      <div v-if="isLoading" class="_skeleton">
        <div class="_category"></div>
        <div class="_category"></div>
      </div>
      <div v-if="!isLoading" class="_content">
        <div 
          v-for="(category, index) in CategoriesList" 
          @click="setActiveTab(category.Key)"
          :key="index" 
          class="_category" 
          :class="{ _active: activeCategory === category.Key }"
        >
          <h4>{{ category.Title }}</h4>
        </div>
      </div>
  </div>

  <div v-if="!isLoading && filterGifts().length === 0" class="_direction _comp _item _gifts _nftNullBlock">
      <div class="_null">
        <div class="_left">
          <div class="_title">
            <h4>{{ $t('profile.profileGiftsNull') }}</h4>
          </div>
          <div class="_descr">
            <p>{{ $t('profile.profileGiftsNullButtonAsking') }}</p>
            <span @click="openStore">
              <div class="kit-icon" v-html="Icon.Store"></div>
              <p>Market</p>
            </span>
          </div>
        </div>
        <div class="_right">
          <div class="_null_buy">
            <button @click="openStore">
              <p>{{ $t('profile.profileGiftsNullButtonBuy') }}</p>
            </button>
          </div>
        </div>
      </div>
  </div>

  <div v-if="!isLoading && activeCategory === 'purchased' && filterGifts().length > 0" class="_direction _comp _item _gifts _nftTransferToReceived">
      <div class="_null">
        <button @click="transferAllToReceived">
          <span>{{ $t('profile.profileTransfersAll') }}</span>
        </button>
      </div>
  </div>

  <div class="_direction _comp _item _gifts">
      <div v-if="isLoading" class="_skeleton">
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
        <div class="_gift"></div>
      </div>
      <div v-if="!isLoading" class="_content">
        <div 
          v-if="GiftsPurchasedList.length > 0 || GiftsReceivedList.length > 0"
          v-for="(gift, index) in filterGifts()"
          @click="useModal(gift.uuid, gift.status)"
          :key="index" 
          class="_gift"
          :class="storeNftsApp?.[gift.nft_unique_key]?.Rarity"
        >
          <div 
            v-if="gift.upgraded"
            class="_rarityGradient"
            :style="{
              '--center-color': storeCache?.Upgrades?.Backgrounds[
                clearBackgroundName(gift.model_background)
              ]?.BackgroundColors?.Center,
              '--around-color': storeCache?.Upgrades?.Backgrounds[
                clearBackgroundName(gift.model_background)
              ]?.BackgroundColors?.Around
            }"
          ></div>

          <div v-if="gift.status !== 'received'" class="_tickets">
            <img :src="Image_Ticket" alt="button" />
            <p>+{{ storeNftsApp?.[gift.nft_unique_key]?.Tickets }}</p>
          </div>

          <div v-if="!gift.upgraded" class="_symbols">
            <img :src="Image_GiftBg" alt="rarity" />
          </div>
          <div v-if="gift.upgraded" class="_symbols">
            <img :src="getUpgradedSymbol(gift.model_symbol)" :alt="gift.model_symbol" />
          </div>

          <div 
            v-if="gift.upgraded"
            class="_number"
          >
            <span>
              #{{ gift.model_number }}
            </span>
          </div>

          <div 
            v-if="!gift.upgraded"
            class="_rarity"
            :class="storeNftsApp?.[gift.nft_unique_key]?.Rarity"
          >
            <div class="_image">
              <img 
                v-if="gift.status == 'sended'"
                :src="Image_RarirySended"
                alt="rarity" 
              />
              <img 
                v-else
                :src="checkRarityImage(storeNftsApp?.[gift.nft_unique_key]?.Rarity)" 
                alt="rarity" 
              />
            </div>
            <div class="_text">
              <span v-if="gift.status == 'sended'">
                {{ $t('profile.profileGiftSended') }}
              </span>
              <span v-else>
                1 {{ $t('app.supplySubmission') }}
                {{ checkRariryNumber(storeNftsApp?.[gift.nft_unique_key]?.Supply) }}
              </span>
            </div>
          </div>

          <div v-if="!gift.upgraded" class="_nft">
            <img :src="storeNftsApp?.[gift.nft_unique_key]?.ImageMain" alt="nft" />
          </div>
          <div v-if="gift.upgraded" class="_nft">
            <img :src="getUpgradedModel(gift.nft_unique_key, gift.model_name)" alt="nft" />
          </div>

          <div v-if="activeCategory === 'received'" class="_buy">
              <button v-if="!gift.upgraded">
                <img class="starsSmall" :src="Image_Stars" alt="stars" />
                <p>{{ storeNftsApp?.[gift.nft_unique_key]?.Price }}</p>
              </button>
              <button v-if="gift.upgraded">
                <p>{{ $t('profile.profileActions') }}</p>
            </button>
          </div>
          <div v-if="activeCategory === 'purchased'" class="_sendNft">
            <button :class="{ _loading: activeGift === gift.id }">
              <p>{{ $t('profile.profileGiftsGiftSend') }}</p>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkRarity, checkRariryNumber, getUpgradedSymbol, getUpgradedModel, clearBackgroundName } from '../../utils/useGift';
import { getConfig } from '../../config';
import { ref, watch, onMounted } from 'vue';
import { checkRarityImage } from '../../utils/useGift';
import { Icon } from '../Icon';
import { getUserLanguage } from '../../utils/useApp';

import Notiflix from 'notiflix';
import TelegramModule from '../../hooks/useTelegram';
import * as nftApi from '../../api/nftApi';
import * as telegramApi from '../../api/telegramApi';

import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Image_RarirySended from '@/assets/images/sended.svg';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_Stars from '@/assets/images/stars.png';

import Lottie from '../Lottie.vue';
import Button from '../Button.vue';
import Funcs from './Funcs.vue';
import { showToast } from '../../utils/toastManager';

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
    NftUniqueKey: {
      type: String,
      required: true,
    },
    CategoriesList: {
      type: Array,
      required: true,
    },
    GiftsReceivedList: {
      type: Array,
      required: true,
    },
    GiftsPurchasedList: {
      type: Array,
      required: true,
    },
    ActiveTab: {
      type: String,
      required: true,
    },
  },

  components: {
    Lottie,
    Button,
    Funcs,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore(),
      storeNftsApp: {},

      isLoading: this.$props.Skeleton,

      activeReceivedTab: true,
      activePurchasedTab: false,

      activeCategory: this.$props.ActiveTab,
      activeGift: null,

      checkRarity,
      checkRariryNumber,
      checkRarityImage,
      getUpgradedSymbol,
      getUpgradedModel,
      clearBackgroundName,
      
      Icon,
      Image_GiftBg,
      Image_RarirySended,
      Image_Ticket,
      Image_Stars,
    };
  },

  mounted() {
    this.loadResources();
    this.storeNftsApp = this.storeCache.NftsAppData;

    this.$watch(() => this.storeCache.NftsAppData, () => {
      this.storeNftsApp = this.storeCache.NftsAppData;
    });

    this.setActiveCategoryFromHash();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
  },

  watch: {
    ActiveTab(newValue) {
      this.activeCategory = newValue;
    },
    GiftsReceivedList(newValue) {
      this.GiftsReceivedList.splice(0, this.GiftsReceivedList.length, ...newValue);
    },
    GiftsPurchasedList(newValue) {
      this.GiftsPurchasedList.splice(0, this.GiftsPurchasedList.length, ...newValue);
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
      const giftsImages = (Array.isArray(this.storeCache?.NftsApp) ? this.storeCache?.NftsApp : Object.values(this.storeCache?.NftsApp || {})).map((gift) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = gift.ImageMain;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      const staticImages = [
        Image_GiftBg
      ].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...giftsImages, ...staticImages]);
    },

    setActiveCategoryFromHash() {
      if (this.$route.hash) {
        const hash = this.$route.hash.replace('#', '');
        if (hash !== 'received' && hash !== 'purchased') {
          this.activeCategory = 'received';
          this.$emit('useTab', 'received');
          return;
        }
        this.activeCategory = this.$route.hash.replace('#', '') || 'received';
        this.$emit('useTab', this.$route.hash.replace('#', '') || 'received');
      }

      watch(() => this.$route.hash, (newHash) => {
        const hash = newHash.replace('#', '');
        if (hash !== 'received' && hash !== 'purchased') {
          this.activeCategory = 'received';
          this.$emit('useTab', 'received');
          return;
        }
        this.activeCategory = newHash.replace('#', '') || 'received';
        this.$emit('useTab', newHash.replace('#', '') || 'received');
      });
    },

    setActiveTab(arg) {
      this.activeCategory = arg;
      this.$emit('useTab', arg);
    },

    setActiveTabAccordion(arg) {
      if (arg === 'received') this.activeReceivedTab = !this.activeReceivedTab;
      if (arg === 'purchased') this.activePurchasedTab = !this.activePurchasedTab;
    },

    filterGifts() {
      if (this.activeCategory === 'received') return this.GiftsReceivedList;
      if (this.activeCategory === 'purchased') return this.GiftsPurchasedList;
      return gifts;
    },

    openStore() {
      this.$router.push('/');
    },

    openMulticheck() {
      this.$router.push('/multicheck');
    },

    appLanguage() {
      return this.storeCache.TelegramData.user.language || getUserLanguage();
    },

    async sendNft(giftId, giftUniqueKey, giftUuid) {
      if (!giftId) return;
      this.activeGift = giftId;

      TelegramModule.useMediumHaptic();

      const preparedMessage = await telegramApi.createPrepareMessage(
        this.storeCache.TelegramData.user.id,
        giftUniqueKey,
        giftUuid,
        this.appLanguage()
      );
      if (!preparedMessage) return;

      const giftToUpdate = this.GiftsPurchasedList.find(gift => gift.id === giftId);
      if (!giftToUpdate) return;

      TelegramModule.useShareMessage(preparedMessage.id)
        .then(async (sharedMessage) => {
          await nftApi.updateStatusSended(this.storeCache.TelegramData.user.id, giftToUpdate.id);

          this.activeGift = null;

          if (giftToUpdate.status !== 'sended') {
            this.storeCache.UserData.sendedGiftsCount += 1;
          }
           
          giftToUpdate.status = 'sended';
        })
        .catch(() => {
          this.activeGift = null;
        });
    },

    useModal(NftId, NftStatus) {
      TelegramModule.useSoftHaptic();
      this.$emit('useModal', { id: NftId, type: NftStatus });
    },

    transferAllToReceived() {
      Notiflix.Confirm.show(
        this.$t('profile.profileConfirmTransfers.title'),
        this.$t('profile.profileConfirmTransfers.descr'),
        this.$t('profile.profileConfirmTransfers.button'),
        this.$t('profile.profileConfirmTransfers.buttonCancel'),
        async () => {
          const response = await nftApi.swapAll(this.NftUniqueKey);
          if (response && response.count > 0) {
            showToast(this.$t('profile.profileConfirmTransfers.success', { 
              count: response.count
            }), 'success');
            this.$emit('transferAllToReceived');
          } else {
            showToast(this.$t('profile.profileConfirmTransfers.error'), 'error');
          }
        },
        () => {
          // cancel
        }
      );
    },

    openStore() {
      this.$router.push('/m');
    },
  },
};
</script>