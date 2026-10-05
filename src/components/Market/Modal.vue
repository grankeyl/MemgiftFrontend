<template>
  <div class="overlay mgm-overlay" :class="{ 'is-open is-dark': isVisible }" @click="closeModal" />

  <div
    v-if="isRendered"
    class="_direction _comp _item giftModal"
    :class="[Key]"
  >
    <!-- Dock: balance chrome above sheet -->
    <div
      class="mgm-dock"
      :class="{ hide: !isVisible, open: isVisible }"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      :style="sheetStyle"
    >
      <div class="mgm-chrome">
        <button type="button" class="mgm-balance" @click="openWallet">
          <Icon class="kit-icon" v-html="Icon.Gram" />
          <span>{{ cutNumber(getBalance) }}</span>
        </button>
      </div>

      <div class="mgm-sheet">
        <button type="button" class="mgm-close" @click="closeModal" aria-label="Close">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </button>

        <div v-if="isLoading" class="mgm-skel">
          <div class="mgm-skel__card"></div>
          <div class="mgm-skel__block"></div>
          <div class="mgm-skel__btn"></div>
        </div>

        <div v-else class="mgm-body">
          <div class="mgm-card market">
            <div
              class="mgm-card__head"
              :style="{
                '--center-color': ModalComp.Info.core.upgrade.background.colors_center,
                '--around-color': ModalComp.Info.core.upgrade.background.colors_around
              }"
            >
              <div class="mgm-card__bg"></div>
              <div class="mgm-card__symbol">
                <img :src="ModalComp.Info.core.upgrade.symbol.image" alt="" />
              </div>
              <div class="mgm-card__mark">
                <p>#{{ ModalComp.Info.core.upgrade.seq }}</p>
              </div>
              <div class="mgm-card__model">
                <!-- One layer only: avoid size jump between static SVG and Lottie -->
                <GiftLottie
                  v-if="isLottieGift && lottiePath && isVisible"
                  :key="`${lottiePath}:${isVisible}`"
                  class="mgm-card__lottie"
                  :path="lottiePath"
                  :loop="true"
                  :autoplay="true"
                  width="0"
                  height="0"
                  renderer="canvas"
                />
                <img
                  v-else
                  class="mgm-card__model-img"
                  :src="modelImageSrc"
                  alt="nft"
                />
              </div>
            </div>
          </div>

          <div class="mgm-title">
            <div class="mgm-title__left">
              <!-- заголовок — сам подарок, а не модель: у части улучшений
                   вид не похож на коллекцию, и покупатель не понимает,
                   что берёт. модель осталась строкой в таблице ниже -->
              <h3>{{ ModalComp.Info.core.gift?.name || ModalComp.Info.core.upgrade?.nft_name?.name }}</h3>
              <div class="mgm-title__price">
                <Icon class="kit-icon" v-html="Icon.Gram" />
                <span>{{ cutNumber(ModalComp.Info.price_ton) }}</span>
              </div>
            </div>
            <div class="mgm-title__tools">
              <button type="button" class="mgm-tool" @click="shareGiftLink">
                <img :src="ForwardImg" alt="" />
              </button>
              <button type="button" class="mgm-tool" @click="copyGiftLink">
                <img :src="CopyImg" alt="" />
              </button>
            </div>
          </div>

          <div class="mgm-info">
            <div class="mgm-info__row">
              <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</span>
              <div class="mgm-info__right">
                <span class="mgm-info__val">{{ ModalComp.Info.core.upgrade.nft_name.name }}</span>
                <span class="mgm-info__pct">{{ ModalComp.Info.core.upgrade.nft_name.drop_rate }}%</span>
              </div>
            </div>
            <div class="mgm-info__row">
              <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</span>
              <div class="mgm-info__right">
                <span class="mgm-info__val">{{ ModalComp.Info.core.upgrade.symbol.name }}</span>
                <span class="mgm-info__pct">{{ ModalComp.Info.core.upgrade.symbol.drop_rate }}%</span>
              </div>
            </div>
            <div class="mgm-info__row">
              <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</span>
              <div class="mgm-info__right">
                <span class="mgm-info__val">{{ ModalComp.Info.core.upgrade.background.name }}</span>
                <span class="mgm-info__pct">{{ ModalComp.Info.core.upgrade.background.drop_rate }}%</span>
              </div>
            </div>
            <div class="mgm-info__row">
              <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
              <div class="mgm-info__right">
                <span class="mgm-info__val">{{ getSupply }}</span>
              </div>
            </div>
          </div>

          <div class="mgm-footer market">
            <!-- кнопка корзины временно скрыта -->
            <button
              v-if="false"
              type="button"
              class="mgm-footer__basket"
              :class="{ added: ModalComp.BasketStatus }"
              @click="addToBasket(ModalComp.Info)"
            >
              <img :src="BasketWhiteImg" alt="" />
            </button>
            <button
              type="button"
              class="mgm-footer__buy"
              :class="{ _loading: ActiveButton }"
              :disabled="!checkBalanceAndPrice"
              @click="buyGift(ModalComp.Info.id)"
            >
              <template v-if="!ActiveButton">
                <span>{{ $t('market.buy') }}</span>
                <Icon class="kit-icon" v-html="Icon.Gram" />
                <span>{{ cutNumber(ModalComp.Info.price_ton) }}</span>
              </template>
              <Lottie
                v-if="ActiveButton"
                class="mgm-footer__spin"
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
  </div>
</template>

<script>
import WebApp from '@twa-dev/sdk';
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
      isRendered: false,
      isVisible: false,
      closeTimer: null,
      Icon, Image_Stars, getUpgradedModel, cutNumber,
    };
  },

  mounted() {
    this.loadResources();
    if (this.ModalActive || this.ModalComp?.ModalActive) {
      this.openSheet();
    }
  },

  beforeUnmount() {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  },

  watch: {
    ModalActive(val) {
      if (val) this.openSheet();
      else if (this.isRendered && this.isVisible) this.startClose(false);
    },
    'ModalComp.ModalActive'(val) {
      if (val) this.openSheet();
    },
  },

  computed: {
    getSupply() {
      const data = this.storeCache.NftsAppData[this.ModalComp.Info?.core?.gift?.u_key];
      if (!data) return '—';
      return `${Math.max(data.Supply - data.SupplyUsers, 0)} / ${data.Supply}`;
    },
    isLoading() { return this.Skeleton },
    sheetStyle() {
      if (!this.isDragging || !this.isVisible) return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
        animation: 'none',
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
    isLottieGift() {
      const media = this.ModalComp?.Info?.core?.gift?.media;
      const image = this.ModalComp?.Info?.core?.upgrade?.nft_name?.image || '';
      // API marks media=lottie; for upgraded models image is often already a .json URL
      return media === 'lottie' || /\.json(\?|$)/i.test(String(image));
    },
    // Static svg preview (always available for cards / non-lottie)
    modelImageSrc() {
      const info = this.ModalComp?.Info;
      if (!info?.core) return '';
      const uKey = info.core.gift?.u_key || info.core.upgrade?.u_key;
      const modelName = info.core.upgrade?.nft_name?.name;
      const apiImage = info.core.upgrade?.nft_name?.image || '';
      // Prefer explicit svg; if API image is .json, build .svg instead
      if (apiImage && !/\.json(\?|$)/i.test(apiImage)) {
        return apiImage;
      }
      return getUpgradedModel(uKey, modelName, 'svg') || apiImage || '';
    },
    // Lottie JSON: API already returns full .json URL for animated models
    lottiePath() {
      const info = this.ModalComp?.Info;
      if (!info?.core) return '';
      const apiImage = info.core.upgrade?.nft_name?.image || '';
      if (apiImage && /\.json(\?|$)/i.test(apiImage)) {
        return apiImage;
      }
      const media = info.core.gift?.media;
      if (media !== 'lottie') return '';
      const uKey = info.core.gift?.u_key || info.core.upgrade?.u_key;
      const modelName = info.core.upgrade?.nft_name?.name;
      // Convert svg API image → json, or construct S3 path
      if (apiImage && /\.svg(\?|$)/i.test(apiImage)) {
        return apiImage.replace(/\.svg(\?|$)/i, '.json$1');
      }
      return getUpgradedModel(uKey, modelName, 'json') || '';
    },
    getGemsUrl() {
      const info = this.ModalComp?.Info || {};
      const addr =
        info.address ||
        info.nft_address ||
        info.item_address ||
        info.core?.address ||
        info.core?.nft_address ||
        info.core?.gift?.address ||
        info.core?.gift?.nft_address;

      if (addr) {
        return `https://getgems.io/nft/${addr}`;
      }

      // Fallback: open gift by TG slug (Name-123) — GetGems indexes these
      const name = info.core?.upgrade?.nft_name?.name || '';
      const seq = info.core?.upgrade?.seq;
      if (name && seq != null && seq !== '') {
        const slug = String(name).replace(/\s+/g, '');
        return `https://getgems.io/nft/${slug}-${seq}`;
      }

      return 'https://getgems.io/';
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
    openSheet() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
      this.isRendered = true;
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.isVisible = true;
        });
      });
    },
    startClose(emitParent = true) {
      if (!this.isRendered) return;
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.isVisible = false;
      this.isDragging = false;
      this.dragY = 0;
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(() => {
        this.isRendered = false;
        this.closeTimer = null;
        if (emitParent) this.$emit('closeModal');
      }, 340);
    },
    closeModal() {
      this.startClose(true);
    },
    shareGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      TelegramModule.useShare(url, `Check out "${this.ModalComp.Info?.core?.upgrade?.nft_name?.name}" NFT.`);
    },
    copyGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      copyToClipboard(url);
      showToast(this.$t('profile.profileCopiedLink'), 'success');
    },
    openOnGetGems() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      const url = this.getGemsUrl;
      try {
        if (WebApp?.openLink) {
          WebApp.openLink(url);
        } else {
          window.open(url, '_blank');
        }
      } catch {
        window.open(url, '_blank');
      }
    },
    addToBasket(gift) {
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.$emit('addToBasket', gift);
    },
    onTouchStart(e) {
      if (!this.isVisible) return;
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
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.ActiveButton = true;
      MarketLotApi.buy(id)
        .then(async (data) => {
          this.ActiveButton = false;
          if (data.ok) {
            if (this.storeCache.UserData.user.Balance.balance_ton) {
              this.storeCache.UserData.user.Balance.balance_ton = parseFloat(this.storeCache.UserData.user.Balance.balance_ton) - parseFloat(data.price_ton);
            }
            this.$emit('notifyBuyed', id);
            this.startClose(true);
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
