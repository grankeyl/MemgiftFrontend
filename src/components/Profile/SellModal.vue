<template>
  <Teleport to="body">
    <div class="overlay mgm-overlay" :class="{ 'is-open is-dark': isVisible }" @click="closeModal" />

    <div v-if="isRendered" class="_direction _comp _item giftModal pgm-sell-modal">
      <div
        class="mgm-dock pgm-dock"
        :class="{ hide: !isVisible, open: isVisible }"
        :style="sheetStyle"
        @touchstart.passive="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div class="mgm-sheet">
          <button type="button" class="mgm-close" :disabled="isSubmitting" aria-label="Close" @click="closeModal">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </button>

          <div v-if="!gift" class="pgm-sell-empty">
            <h3>Gift unavailable</h3>
            <p>Close this window and try again.</p>
          </div>

          <div v-else class="mgm-body">
            <div class="mgm-card market">
              <div class="mgm-card__head" :style="previewStyle">
                <div class="mgm-card__bg"></div>
                <div class="mgm-card__symbol">
                  <img :src="gift.symbol_image" alt="" />
                </div>
                <div class="mgm-card__mark">
                  <p>#{{ gift.seq }}</p>
                </div>
                <div class="mgm-card__model">
                  <img class="mgm-card__model-img" :src="modelImage" alt="nft" />
                </div>
              </div>
            </div>

            <div class="mgm-title">
              <div class="mgm-title__left">
                <h3>{{ gift.nft_name }}</h3>
              </div>
            </div>

            <div class="pgm-sell-form">
              <div class="pgm-recipient-search pgm-sell-input" :class="{ error: priceError || submitError }">
                <input
                  id="pgm-sell-price"
                  v-model="priceInput"
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  placeholder="0"
                  :disabled="isSubmitting"
                  @input="onPriceInput"
                  @blur="onPriceBlur"
                />
                <div class="pgm-sell-input__unit">
                  <img :src="TonImg" alt="TON" />
                  <span>TON</span>
                </div>
              </div>

              <div class="pgm-sell-summary">
                <div class="pgm-sell-summary__row">
                  <span class="pgm-sell-summary__label">{{ $t('profile.profileSellMinimum') }}</span>
                  <span class="pgm-sell-summary__value">
                    <template v-if="isMinimumLoading">…</template>
                    <template v-else>{{ cutNumber(minimumPrice) }} TON</template>
                  </span>
                </div>
                <div class="pgm-sell-summary__row">
                  <span class="pgm-sell-summary__label">{{ $t('profile.profileSellTotal') }}</span>
                  <span class="pgm-sell-summary__value">{{ cutNumber(totalAmount) }} TON</span>
                </div>
              </div>

              <p v-if="priceError" class="pgm-recipient-error">{{ priceError }}</p>
              <p v-else-if="minimumError" class="pgm-recipient-error">{{ minimumError }}</p>
              <p v-else-if="submitError" class="pgm-recipient-error">{{ submitError }}</p>
            </div>

            <div class="mgm-footer market pgm-transfer-footer">
              <button
                type="button"
                class="mgm-footer__buy"
                :class="{ _loading: isSubmitting }"
                :disabled="!canSubmit"
                @click="apply"
              >
                <span class="pgm-send-button__content" :class="{ hidden: isSubmitting }">
                  <span>{{ $t('profile.profileSellFor') }}</span>
                  <span class="pgm-transfer-cost">
                    <img :src="TonWhiteImg" alt="TON" />
                    <span>{{ cutNumber(priceValue) }}</span>
                  </span>
                </span>
                <span class="pgm-send-button__loading" :class="{ visible: isSubmitting }">
                  <IOSLoader class="mgm-footer__spin" />
                  <span>{{ $t('profile.profileSellSubmitting') }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { cutNumber, cutNumberNano } from '../../utils/useTon';
import { getUpgradedModel } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import TelegramModule from '../../hooks/useTelegram';
import IOSLoader from '../IOSLoader.vue';
import * as MarketNftApi from '@/api/market/nft';
import TonImg from '@/assets/images/market/ton.svg';
import TonWhiteImg from '@/assets/images/market/ton-white.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    ModalSellList: { type: Array, required: true },
  },

  components: { IOSLoader },

  data() {
    return {
      storeCache: useCacheStore(),
      priceInput: '',
      minimumPrice: 5,
      isMinimumLoading: false,
      minimumError: '',
      submitError: '',
      isSubmitting: false,
      isRendered: false,
      isVisible: false,
      closeTimer: null,
      minimumRequestKey: '',
      dragY: 0,
      startY: 0,
      startX: 0,
      startTimeMs: 0,
      isDragging: false,
      Icon,
      TonImg,
      TonWhiteImg,
      cutNumber,
    };
  },

  computed: {
    gift() {
      return this.ModalSellList?.[0] || null;
    },
    priceValue() {
      return Number(this.priceInput || 0);
    },
    totalAmount() {
      return this.priceValue * 0.95;
    },
    priceError() {
      if (!this.priceInput || this.priceValue === 0) return '';
      if (this.priceValue < this.minimumPrice) return `Minimum price is ${cutNumber(this.minimumPrice)} TON`;
      if (this.priceValue > 15000) return 'Maximum price is 15,000 TON';
      return '';
    },
    canSubmit() {
      return !!this.gift && !this.isMinimumLoading && !this.minimumError && !this.priceError && this.priceValue > 0 && !this.isSubmitting;
    },
    modelImage() {
      if (!this.gift) return '';
      if (this.gift.gift_media === 'svg' && this.gift.nft_image) return this.gift.nft_image;
      return getUpgradedModel(this.gift.gift_ukey, this.gift.nft_name, 'svg');
    },
    previewStyle() {
      if (!this.gift) return null;
      return {
        '--center-color': this.gift.background_colors_center || '#666',
        '--around-color': this.gift.background_colors_around || '#1a1a1a',
      };
    },
    sheetStyle() {
      if (!this.isDragging || !this.isVisible) return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        animation: 'none',
      };
    },
  },

  watch: {
    ModalActive(value) {
      if (value) this.openSheet();
      else if (this.isRendered && this.isVisible) this.startClose(false);
    },
    'gift.gift_uuid'() {
      if (this.ModalActive) this.resetAndLoad();
    },
  },

  mounted() {
    if (this.ModalActive) this.openSheet();
  },

  beforeUnmount() {
    if (this.closeTimer) clearTimeout(this.closeTimer);
  },

  methods: {
    openSheet() {
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.isRendered = true;
      this.resetAndLoad();
      this.$nextTick(() => requestAnimationFrame(() => { this.isVisible = true; }));
    },
    startClose(emitParent = true) {
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
      if (this.isSubmitting) return;
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.startClose(true);
    },
    resetAndLoad() {
      this.priceInput = '';
      this.minimumPrice = 5;
      this.minimumError = '';
      this.submitError = '';
      this.isSubmitting = false;
      this.getMinimumPrice();
    },
    sanitizePrice(value, decimals = 2) {
      let result = String(value || '').replace(',', '.').replace(/[^\d.]/g, '');
      const dot = result.indexOf('.');
      if (dot !== -1) result = result.slice(0, dot + 1) + result.slice(dot + 1).replace(/\./g, '');
      const [integer = '', fraction = ''] = result.split('.');
      const normalizedInteger = integer.replace(/^0+(?=\d)/, '') || (result.startsWith('0') ? '0' : '');
      if (result.endsWith('.')) return `${normalizedInteger || '0'}.`;
      return fraction ? `${normalizedInteger || '0'}.${fraction.slice(0, decimals)}` : normalizedInteger;
    },
    onPriceInput(event) {
      this.priceInput = this.sanitizePrice(event.target.value);
      event.target.value = this.priceInput;
      this.submitError = '';
    },
    onPriceBlur() {
      if (this.priceInput.endsWith('.')) this.priceInput = this.priceInput.slice(0, -1);
    },
    async getMinimumPrice() {
      const gift = this.gift;
      if (!gift?.gift_ukey) return;
      const requestKey = `${gift.gift_uuid}:${gift.gift_ukey}`;
      this.minimumRequestKey = requestKey;
      this.isMinimumLoading = true;
      this.minimumError = '';
      try {
        const response = await MarketNftApi.minPrice(gift.gift_ukey);
        if (this.minimumRequestKey !== requestKey) return;
        if (!response || response.min == null) {
          this.minimumError = this.$t('profile.profileSellMinError');
          return;
        }
        this.minimumPrice = Number(response.min);
      } catch {
        if (this.minimumRequestKey === requestKey) this.minimumError = this.$t('profile.profileSellMinError');
      } finally {
        if (this.minimumRequestKey === requestKey) this.isMinimumLoading = false;
      }
    },
    async apply() {
      if (!this.canSubmit) return;
      const gift = this.gift;
      this.isSubmitting = true;
      this.submitError = '';
      // владелец баланса на маркете — это uuid самого пользователя:
      // именно по нему App.vue запрашивает баланс. объект Balance приходит
      // только когда маркет уже знает пользователя, поэтому опираться на
      // него нельзя — иначе выставление блокируется с ложным «подключите
      // кошелёк». обращение через ?. обязательно: раньше пустой Balance
      // бросал TypeError, его глотал catch и наружу шла общая ошибка
      const balanceUuid =
        this.storeCache.UserData?.user?.Balance?.user_uuid ||
        this.storeCache.UserData?.user?.ID ||
        '';
      if (!balanceUuid) {
        this.submitError = this.$t('profile.profileSellError');
        showToast(this.submitError, 'error');
        this.isSubmitting = false;
        return;
      }

      try {
        const response = await MarketNftApi.create(
          gift.gift_uuid,
          balanceUuid,
          this.priceValue,
          false,
        );
        if (!response?.lot) {
          this.submitError = this.$t('profile.profileSellError');
          showToast(this.submitError, 'error');
          return;
        }
        this.$emit('apply', {
          lot_id: response.lot.id,
          gift_uuid: gift.gift_uuid,
          price_ton: cutNumberNano(response.lot.price_nano_com),
        });
      } catch {
        this.submitError = this.$t('profile.profileSellError');
        showToast(this.submitError, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },
    onTouchStart(event) {
      if (!this.isVisible || this.isSubmitting) return;
      const touch = event.touches?.[0] ?? event;
      this.isDragging = true;
      this.startY = touch.clientY;
      this.startX = touch.clientX;
      this.startTimeMs = performance.now();
      this.dragY = 0;
    },
    onTouchMove(event) {
      if (!this.isDragging) return;
      const touch = event.touches?.[0] ?? event;
      const dy = touch.clientY - this.startY;
      if (Math.abs(touch.clientX - this.startX) > Math.abs(dy)) return;
      this.dragY = Math.max(0, dy);
    },
    onTouchEnd() {
      if (!this.isDragging) return;
      const elapsed = Math.max(1, performance.now() - this.startTimeMs);
      const distance = this.dragY;
      this.isDragging = false;
      if (distance > 120 || distance / elapsed > 0.6) this.closeModal();
      else this.dragY = 0;
    },
  },
};
</script>

<style lang="sass" scoped>
@use "../Market/Modal.sass"
@use "./ProfileGiftModal.sass"
</style>
