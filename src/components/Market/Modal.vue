<template>
  <div class="overlay" :class="{ 'is-open is-dark': ModalActive }" @click="closeModal" />

  <div v-if="ModalActive" class="mkt-balance" @click="openWallet">
    <div class="mkt-balance__ctx">
      <h4>{{ cutNumber(getBalance) }}</h4>
      <img :src="TonImg" alt="ton" />
    </div>
    <div class="mkt-balance__btn">
      <img :src="PlusImg" alt="plus" />
    </div>
  </div>

  <div 
    v-if="ModalComp.ModalActive"
    class="_direction _comp _item giftModal"
    :class="[Key]"
  >
    <div 
      class="mkt-sheet"
      :class="{ hide: !ModalActive }"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      :style="sheetStyle"
    >
      <!-- Drag handle -->
      <div class="mkt-sheet__handle">
        <div class="mkt-sheet__bar"></div>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="mkt-sheet__skel">
        <div class="skel-hero"></div>
        <div class="skel-lines">
          <div class="skel-l skel-w60"></div>
          <div class="skel-l skel-w30"></div>
        </div>
        <div class="skel-table">
          <div class="skel-row" v-for="n in 3" :key="n"></div>
        </div>
        <div class="skel-btns">
          <div class="skel-btn"></div>
          <div class="skel-btn skel-primary"></div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="mkt-sheet__body">
        <!-- Hero -->
        <div 
          class="mkt-hero"
          :style="{
            '--center-color': ModalComp.Info.core.upgrade.background.colors_center,
            '--around-color': ModalComp.Info.core.upgrade.background.colors_around
          }"
        >
          <div class="mkt-hero__gradient"></div>
          <div class="mkt-hero__symbol">
            <img :src="ModalComp.Info.core.upgrade.symbol.image" alt="symbol" />
          </div>

          <div class="mkt-hero__badge">
            <span>#{{ ModalComp.Info.core.upgrade.seq }}</span>
          </div>

          <div class="mkt-hero__img">
            <img 
              v-if="ModalComp.Info.core.gift.media === 'svg'"
              :src="ModalComp.Info.core.upgrade.nft_name.image"
              alt="nft"
            />
            <GiftLottie
              v-if="ModalComp.Info.core.gift.media === 'lottie'"
              class="mkt-hero__lottie"
              :path="ModalComp.Info.core.upgrade.nft_name.image"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
          </div>

          <h3 class="mkt-hero__name">{{ ModalComp.Info.core.upgrade.nft_name.name }}</h3>

          <div class="mkt-hero__actions">
            <button @click="shareGiftLink">
              <img :src="ForwardImg" alt="share" />
            </button>
            <button @click="copyGiftLink">
              <img :src="CopyImg" alt="copy" />
            </button>
          </div>
        </div>

        <!-- Price row -->
        <div class="mkt-price">
          <div class="mkt-price__main">
            <h2>{{ cutNumber(ModalComp.Info.price_ton) }}</h2>
            <img :src="TonImg" alt="ton" />
          </div>
          <p class="mkt-price__hint" v-if="!checkBalanceAndPrice">{{ $t('market.basket.insufficientBalance') }}</p>
        </div>

        <!-- Info chips -->
        <div class="mkt-chips">
          <div class="mkt-chip">
            <span class="mkt-chip__label">{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</span>
            <span class="mkt-chip__val">{{ ModalComp.Info.core.upgrade.nft_name.name }}</span>
            <span class="mkt-chip__pct">{{ ModalComp.Info.core.upgrade.nft_name.drop_rate }}%</span>
          </div>
          <div class="mkt-chip">
            <span class="mkt-chip__label">{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</span>
            <span class="mkt-chip__val">{{ ModalComp.Info.core.upgrade.symbol.name }}</span>
            <span class="mkt-chip__pct">{{ ModalComp.Info.core.upgrade.symbol.drop_rate }}%</span>
          </div>
          <div class="mkt-chip">
            <span class="mkt-chip__label">{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</span>
            <span class="mkt-chip__val">{{ ModalComp.Info.core.upgrade.background.name }}</span>
            <span class="mkt-chip__pct">{{ ModalComp.Info.core.upgrade.background.drop_rate }}%</span>
          </div>
          <div class="mkt-chip">
            <span class="mkt-chip__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
            <span class="mkt-chip__val">{{ getSupply }}</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="mkt-btns">
          <button class="mkt-btns__basket" @click="addToBasket(ModalComp.Info)" :class="{ added: ModalComp.BasketStatus }">
            <img :src="BasketWhiteImg" alt="basket" />
            <h4 v-if="ModalComp.BasketStatus">{{ $t('market.modal.removeBasket') }}</h4>
            <h4 v-else>{{ $t('market.modal.addBasket') }}</h4>
          </button>
          <button class="mkt-btns__buy" :class="{ _loading: ActiveButton }" :disabled="!checkBalanceAndPrice" @click="buyGift(ModalComp.Info.id)">
            <template v-if="!ActiveButton">
              <h4>{{ $t('market.buy') }} {{ cutNumber(ModalComp.Info.price_ton) }}</h4>
              <img :src="TonWhiteImg" alt="ton" />
            </template>
            <Lottie 
              v-if="ActiveButton"
              class="mkt-btns__spinner" 
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
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { getUpgradedModel } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { cutNumber } from '../../utils/useTon';

import * as MarketLotApi from '@/api/market/lots';

import TelegramModule from '../../hooks/useTelegram';
import Image_Stars from '@/assets/images/stars.png';
import Lottie from '../Lottie.vue';
import GiftLottie from '../GiftLottie.vue';

import TonImg from '@/assets/images/market/ton.svg';
import PlusImg from '@/assets/images/market/plus.svg';
import ForwardImg from '@/assets/images/forward.svg';
import CopyImg from '@/assets/images/copy.svg';
import BasketWhiteImg from '@/assets/images/market/basket-white.svg';
import TonWhiteImg from '@/assets/images/market/ton-white.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    ModalComp: { type: Object, required: true },
  },

  components: { Lottie, GiftLottie },

  data() {
    return {
      TonImg, PlusImg, ForwardImg, CopyImg, BasketWhiteImg, TonWhiteImg,
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,
      ActiveButton: false,
      dragY: 0, startY: 0, startX: 0, isDragging: false, startTimeMs: 0,
      Icon, Image_Stars, getUpgradedModel, cutNumber,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    getSupply() {
      const data = this.storeCache.NftsAppData[this.ModalComp.Info?.core?.gift?.u_key];
      if (!data) return '—';
      return `${Math.max(data.Supply - data.SupplyUsers, 0)} / ${data.Supply}`;
    },
    isLoading() { return this.Skeleton },
    sheetStyle() {
      if (!this.isDragging || !this.ModalActive) return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
      };
    },
    checkBalanceAndPrice() {
      try {
        return parseFloat(this.storeCache.UserData.user.Balance.balance_ton) >= parseFloat(this.ModalComp.Info.price_ton);
      } catch { return false; }
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([document.fonts.ready, this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch {}
    },
    loadImages() {
      return Promise.all([Image_Stars].map(src =>
        new Promise((res, rej) => { const img = new Image(); img.src = src; img.onload = res; img.onerror = rej; })
      ));
    },
    closeModal() { this.$emit('closeModal'); },
    shareGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      TelegramModule.useShare(url, `Check out "${this.ModalComp.Info?.core?.upgrade?.nft_name?.name}" NFT.`);
    },
    copyGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      copyToClipboard(url);
      showToast(this.$t('profile.profileCopiedLink'), 'success');
    },
    addToBasket(gift) { this.$emit('addToBasket', gift); },
    onTouchStart(e) {
      if (!this.ModalActive) return;
      const t = e.touches?.[0] ?? e;
      this.isDragging = true;
      this.startY = t.clientY;
      this.startX = t.clientX;
      this.dragY = 0;
      this.startTimeMs = performance.now();
    },
    onTouchMove(e) {
      if (!this.isDragging) return;
      const t = e.touches?.[0] ?? e;
      const dy = t.clientY - this.startY;
      if (Math.abs(t.clientX - this.startX) > Math.abs(dy)) return;
      this.dragY = dy > 0 ? dy : 0;
    },
    onTouchEnd() {
      if (!this.isDragging) return;
      const elapsed = Math.max(1, performance.now() - this.startTimeMs);
      const distance = Math.max(0, this.dragY);
      this.isDragging = false;
      if (distance > 120 || distance / elapsed > 0.6) {
        this.closeModal();
      } else {
        this.dragY = 0;
      }
    },
    buyGift(id) {
      if (!id || !this.checkBalanceAndPrice) return;
      this.ActiveButton = true;
      MarketLotApi.buy(id)
        .then(async (data) => {
          this.ActiveButton = false;
          if (data.ok) {
            if (this.storeCache.UserData.user.Balance.balance_ton) {
              this.storeCache.UserData.user.Balance.balance_ton = parseFloat(this.storeCache.UserData.user.Balance.balance_ton) - parseFloat(data.price_ton);
            }
            this.closeModal();
            this.$emit('notifyBuyed', id);
          } else {
            showToast(data.error, 'error');
          }
        })
        .catch((e) => { this.ActiveButton = false; showToast(e.error, 'error'); });
    },
    openWallet() { this.$router.push('/wallet'); },
  },
};
</script>

<style lang="sass" scoped>
@use "./Modal.sass"
</style>
