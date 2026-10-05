<template>
  <Teleport to="body">
    <div class="overlay mgm-overlay" :class="{ 'is-open is-dark': isVisible }" @click="closeModal" />

    <div v-if="isRendered" class="_direction _comp _item giftModal pgm-modal vgm-modal">
      <div
        class="mgm-dock pgm-dock"
        :class="{ hide: !isVisible, open: isVisible }"
        @touchstart.passive="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        :style="sheetStyle"
      >
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
            <div class="mgm-card">
              <div
                class="mgm-card__head"
                :class="[isUpgraded ? 'is-upg' : normalizedRarity]"
                :style="cardHeadStyle"
              >
                <div class="mgm-card__bg"></div>
                <div class="mgm-card__symbol">
                  <img v-if="isUpgraded && UpgradedNft?.SymbolImage" :src="UpgradedNft.SymbolImage" alt="" />
                  <img v-else :src="Image_GiftBg" alt="" />
                </div>
                <div v-if="isUpgraded && UpgradedNft?.ModelNumber != null" class="mgm-card__mark">
                  <p>#{{ UpgradedNft.ModelNumber }}</p>
                </div>
                <div class="mgm-card__model">
                  <GiftLottie
                    v-if="showLottie && lottiePath && isVisible"
                    :key="`${lottiePath}:${isVisible}`"
                    class="mgm-card__lottie"
                    :path="lottiePath"
                    :loop="true"
                    :autoplay="true"
                    width="0"
                    height="0"
                    renderer="canvas"
                  />
                  <img v-else class="mgm-card__model-img" :src="modelImageSrc" alt="nft" />
                </div>
              </div>
            </div>

            <div class="mgm-title">
              <div class="mgm-title__left">
                <h3>{{ displayName }}</h3>
                <div v-if="isUpgraded && ModalComp.Market?.MarketOn" class="mgm-title__price">
                  <div class="kit-icon" v-html="Icon.Gram"></div>
                  <span>{{ cutNumber(ModalComp.Market.TonPrice) }}</span>
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
              <template v-if="isUpgraded">
                <div class="mgm-info__row">
                  <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</span>
                  <div class="mgm-info__right">
                    <span class="mgm-info__val">{{ modelNameText }}</span>
                    <span v-if="modelDropRate" class="mgm-info__pct">{{ modelDropRate }}%</span>
                  </div>
                </div>
                <div class="mgm-info__row">
                  <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</span>
                  <div class="mgm-info__right">
                    <span class="mgm-info__val">{{ symbolNameText }}</span>
                    <span v-if="UpgradedNft?.SymbolDropRate" class="mgm-info__pct">{{ UpgradedNft.SymbolDropRate }}%</span>
                  </div>
                </div>
                <div class="mgm-info__row">
                  <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</span>
                  <div class="mgm-info__right">
                    <span class="mgm-info__val">{{ backgroundNameText }}</span>
                    <span v-if="UpgradedNft?.BackgroundDropRate" class="mgm-info__pct">{{ UpgradedNft.BackgroundDropRate }}%</span>
                  </div>
                </div>
                <div class="mgm-info__row">
                  <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
                  <div class="mgm-info__right">
                    <span class="mgm-info__val">{{ Table?.NftSupply || '—' }}</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="mgm-info__row">
                  <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem1') }}</span>
                  <div class="mgm-info__right">
                    <span class="mgm-info__val">{{ Table?.OwnerName || '—' }}</span>
                  </div>
                </div>
                <div class="mgm-info__row">
                  <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
                  <div class="mgm-info__right">
                    <span class="mgm-info__val">{{ Table?.NftSupply || '—' }}</span>
                  </div>
                </div>
              </template>
            </div>

            <div v-if="!isLoading" class="pgm-footer">
              <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="closeModal">
                <span>{{ $t('profile.profileGiftButtonOk') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import * as nftApi from '../../api/nftApi';
import * as invoiceApi from '../../api/invoiceApi';
import * as userApi from '../../api/userApi';
import * as MarketLotsApi from '../../api/market/lots';

import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { fireFromBottom } from '../../utils/useConfetti';
import { getUpgradedModel } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { cutNumber } from '../../utils/useTon';

import TelegramModule from '../../hooks/useTelegram';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';
import GiftLottie from '../GiftLottie.vue';
import Notiflix from 'notiflix';

import ForwardImg from '@/assets/images/forward.svg';
import CopyImg from '@/assets/images/copy.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    ModalTransferActive: { type: Boolean, required: true },
    ModalComp: { type: Object, required: true },
    UpgradedNft: { type: Object, required: true },
    Table: { type: Object, required: true },
  },
  components: { Lottie, GiftLottie },
  data() {
    return {
      ForwardImg, CopyImg,
      storeCache: useCacheStore(),
      isTransferInputSuccess: false,
      transferTimeout: null,
      showDefaultAvatar: false,
      transferUsers: [],
      transferUserSelected: null,
      transferData: { query: null, userId: null, avatar: null, name: null, success: false },
      transferYourselfError: false,
      transferSections: {
        active: { label: this.$t('profile.profileTransferSections.name'), value: 'name' },
        items: [
          { label: this.$t('profile.profileTransferSections.name'), value: 'name' },
          { label: this.$t('profile.profileTransferSections.username'), value: 'username' },
          { label: this.$t('profile.profileTransferSections.telegram_id'), value: 'telegram_id' },
        ],
      },
      ActiveButton: false,
      isLoadingUpgrade: false,
      isLoadingUpgradeImage: false,
      dragY: 0, startY: 0, startX: 0, isDragging: false, startTimeMs: 0,
      isRendered: false, isVisible: false, closeTimer: null,
      Icon, Image_Stars, Image_StarsWhite, Image_GiftBg, getUpgradedModel, cutNumber,
    };
  },
  mounted() {
    this.loadResources();
    if (this.ModalActive) this.openSheet();
  },
  beforeUnmount() {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    ModalActive(val) {
      if (val) this.openSheet();
      else if (this.isRendered && this.isVisible) this.startClose(false);
    },
  },
  computed: {
    isLoading() { return this.Skeleton; },
    // редкость приходит в разном регистре и написании ('Legendary', 'very rare'),
    // а классы фона названы .legend / .veryrare — приводим к ним, как в профиле
    normalizedRarity() {
      let rarity = String(this.ModalComp?.NftRarity || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (rarity === 'legendary') rarity = 'legend';
      if (rarity === 'veryrarity') rarity = 'veryrare';
      return rarity;
    },
    isUpgraded() { return !!this.ModalComp?.NftUpgraded; },
    sheetStyle() {
      if (!this.isDragging || !this.isVisible) return null;
      return { transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`, transition: 'none', willChange: 'transform', animation: 'none' };
    },
    // заголовок — всегда оригинальный подарок, модель показываем строкой ниже
    displayName() {
      return this.ModalComp.GiftName || this.ModalComp.NftName || '';
    },
    modelNameText() {
      const raw = this.UpgradedNft?.ModelName;
      if (!raw) return this.ModalComp.NftName || '';
      if (typeof raw === 'object') return raw.name || raw.Name || '';
      return String(raw);
    },
    modelDropRate() {
      const raw = this.UpgradedNft?.ModelDropRate ?? this.UpgradedNft?.ModelName?.drop_rate;
      return raw || null;
    },
    symbolNameText() {
      const raw = this.UpgradedNft?.SymbolName;
      if (!raw) return '—';
      if (typeof raw === 'object') return raw.name || raw.Name || '—';
      return String(raw);
    },
    backgroundNameText() {
      const raw = this.UpgradedNft?.BackgroundName;
      if (!raw) return '—';
      if (typeof raw === 'object') return raw.name || raw.Name || '—';
      return String(raw);
    },
    cardHeadStyle() {
      if (!this.isUpgraded) return null;
      const center = this.UpgradedNft?.BackgroundColors?.Center;
      const around = this.UpgradedNft?.BackgroundColors?.Around;
      if (!center && !around) return null;
      return { '--center-color': center || '#666', '--around-color': around || '#1a1a1a' };
    },
    showLottie() {
      const media = this.ModalComp?.NftMedia;
      if (this.isUpgraded) {
        const image = this.UpgradedNft?.ModelImage || '';
        return media === 'lottie' || /\.json(\?|$)/i.test(String(image));
      }
      return media === 'lottie';
    },
    modelImageSrc() {
      if (this.isUpgraded) {
        const apiImage = this.UpgradedNft?.ModelImage || '';
        if (apiImage && !/\.json(\?|$)/i.test(apiImage)) return apiImage;
        const uKey = this.ModalComp.NftUniqueKey;
        const modelName = this.modelNameText;
        return getUpgradedModel(uKey, modelName, 'svg') || apiImage || this.ModalComp.NftImage || '';
      }
      return this.ModalComp.NftImage || '';
    },
    lottiePath() {
      if (this.isUpgraded) {
        const apiImage = this.UpgradedNft?.ModelImage || '';
        if (apiImage && /\.json(\?|$)/i.test(apiImage)) return apiImage;
        if (this.ModalComp.NftMedia !== 'lottie') return '';
        if (apiImage && /\.svg(\?|$)/i.test(apiImage)) return apiImage.replace(/\.svg(\?|$)/i, '.json$1');
        const uKey = this.ModalComp.NftUniqueKey;
        const modelName = this.modelNameText;
        return getUpgradedModel(uKey, modelName, 'json') || '';
      }
      if (this.ModalComp.NftMedia !== 'lottie' || !this.ModalComp.NftKey) return '';
      return `/gifts/lottie/${this.ModalComp.NftKey}.json`;
    },
    // Gifts opened from the public profile are view-only: transfer and upgrade
    // actions belong to the owner's profile modal.
    canSend() { return false; },
    showMint() { return false; },
    showSell() { return false; },
    showRemove() { return false; },
  },
  methods: {
    handleClickOutside(event) {
      if (!this.$refs.transferInput?.contains(event.target)) this.blurTransferInput(event);
    },
    async loadResources() {
      try { await Promise.all([document.fonts.ready, this.loadImages()]); this.$emit('loadSuccess'); }
      catch (error) { console.error(error); }
    },
    loadImages() {
      return Promise.all([Image_Stars].map(src => new Promise((resolve, reject) => {
        const img = new Image(); img.src = src; img.onload = resolve; img.onerror = reject;
      })));
    },
    openSheet() {
      if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
      this.isRendered = true;
      this.$nextTick(() => requestAnimationFrame(() => { this.isVisible = true; }));
    },
    startClose(emitParent = true) {
      if (!this.isRendered) { if (emitParent) this.$emit('closeModal'); return; }
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.isVisible = false; this.isDragging = false; this.dragY = 0;
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(() => { this.isRendered = false; this.closeTimer = null; if (emitParent) this.$emit('closeModal'); }, 340);
    },
    closeModal() { this.startClose(true); },
    onPrimarySend() { this.useTransferModal(); },
    async transferNft() {
      if (!this.ModalComp.NftUuid) return;
      Notiflix.Confirm.show(
        this.$t('profile.profileConfirmTransfer.title'),
        this.$t('profile.profileConfirmTransfer.descr'),
        this.$t('profile.profileConfirmTransfer.button'),
        this.$t('profile.profileConfirmTransfer.buttonCancel'),
        async () => {
          const UUIDs = [this.ModalComp.NftUuid];
          const updateNft = await nftApi.swap(UUIDs);
          if (!updateNft) return;
          if (updateNft.status === 'received') this.closeModal();
          this.$emit('transferNft');
          this.closeModal();
        },
        () => {}
      );
    },
    sendNft() {
      if (!this.ModalComp.NftId) return;
      this.useTransferModal();
    },
    useTransferModal() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
      this.isVisible = false; this.isRendered = false;
      this.$emit('closeModal');
      this.$emit('useTransferModal');
    },
    closeTransferModal() { this.$emit('closeTransferModal'); this.$emit('closeModal'); },
    clearTransferData() {
      try { this.transferData = { query: null, userId: null, avatar: null, name: null, success: false }; } catch {}
    },
    closeTransferData() { this.clearTransferData(); this.transferUserSelected = null; this.isTransferInputSuccess = false; },
    keyTransferInput(event) {
      document.addEventListener('click', this.handleClickOutside);
      const eventText = event.target.value.trim();
      this.transferYourselfError = false;
      if (eventText !== '') {
        if (eventText.startsWith('@')) { this.setActiveTransferTab('username'); }
        else if (!isNaN(eventText)) { this.setActiveTransferTab('telegram_id'); }
        else { this.setActiveTransferTab('name'); }
        this.transferData.query = eventText;
        if (this.transferTimeout) clearTimeout(this.transferTimeout);
        this.transferTimeout = setTimeout(() => { this.getTransferData(); }, 1500);
      } else {
        this.transferUsers = []; this.transferUserSelected = null; this.isTransferInputSuccess = false; this.clearTransferData();
      }
    },
    async blurTransferInput(event) {
      if (event?.target) this.keyTransferInput(event);
      if (this.transferData.query) await this.getTransferData();
    },
    async getTransferData() {
      if (!this.transferData.query) return;
      if (this.transferData.query === this.storeCache.UserData.user.Tld.toString()) { this.transferYourselfError = true; return; }
      if (this.transferData.query.startsWith('@')) this.transferData.query = this.transferData.query.slice(1);
      const response = await userApi.searchUser(this.transferData.query);
      if (response) this.transferUsers = response; else this.transferData.success = false;
    },
    async transferGift() {
      if (!this.transferData.success) return;
      await this.transferInvoiceSendGift();
    },
    async transferInvoiceSendGift() {
      if (!this.transferData.success) return;
      if (parseInt(this.transferData.userId) === parseInt(this.storeCache.TelegramData.user.id)) { this.transferYourselfError = true; return; }
      this.ActiveButton = true;
      const nftsToTransfer = [this.ModalComp.NftUuid];
      const transfer = await nftApi.transfer(nftsToTransfer, this.transferData.userId);
      if (!transfer) { showToast('Error transfering gift', 'error'); this.ActiveButton = false; return; }
      this.ActiveButton = false;
      this.storeCache.UserData.sent_user++;
      if (transfer.tickets_rewarded) this.storeCache.UserData.user.Tickets += transfer.tickets_rewarded;
      this.$emit('useTransfered', nftsToTransfer[0]);
      this.closeTransferModal();
    },
    async upgradeNft() {
      this.isLoadingUpgrade = true;
      const invoice = await invoiceApi.createInvoiceNftUpgrade(this.ModalComp.NftUuid);
      const paymentId = invoice.payment_upgrade_id;
      if (!invoice.success) {
        const idDontSuccess = invoice?.payment_upgrade_id || invoice?.UUID;
        if (!idDontSuccess) { this.isLoadingUpgrade = false; return; }
        const upgrade = await nftApi.upgrade(idDontSuccess);
        if (!upgrade) { this.isLoadingUpgrade = false; return; }
        if (upgrade.ok) {
          const upgradeData = upgrade.data;
          this.$emit('UPGRADE', { GiftUuid: this.ModalComp.NftId, GiftMedia: this.ModalComp.NftMedia, ...upgradeData });
          setTimeout(() => {
            this.isLoadingUpgrade = false; this.isLoadingUpgradeImage = false; this.ModalComp.NftUpgraded = true;
            this.$emit('upgradedNftModal', this.ModalComp.NftId, this.UpgradedNft.ModelName, this.UpgradedNft.SymbolName, this.UpgradedNft.BackgroundName, this.UpgradedNft.ModelNumber);
            fireFromBottom();
          }, 400);
          return;
        }
      }
      TelegramModule.useInvoice(invoice.link, async () => {
        const webSocketLink = import.meta.env.VITE_APP_SOCKET_URL;
        const socket = new WebSocket(`${webSocketLink}/payments/ws/${paymentId}`);
        socket.onopen = () => {};
        socket.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          if (data.nft_id === this.ModalComp.NftUuid && data.actual_amount === this.ModalComp.NftUpgradePrice) {
            const upgrade = await nftApi.upgrade(paymentId);
            if (!upgrade || !upgrade.ok) return;
            const upgradeData = upgrade.data;
            this.$emit('UPGRADE', { GiftUuid: this.ModalComp.NftId, GiftMedia: this.ModalComp.NftMedia, ...upgradeData });
            setTimeout(() => {
              this.isLoadingUpgrade = false; this.isLoadingUpgradeImage = false; this.ModalComp.NftUpgraded = true;
              this.$emit('upgradedNftModal', this.ModalComp.NftId, this.UpgradedNft.ModelName, this.UpgradedNft.SymbolName, this.UpgradedNft.BackgroundName, this.UpgradedNft.ModelNumber);
              fireFromBottom();
            }, 400);
          }
        };
        socket.onclose = () => {};
        socket.onerror = (err) => { console.error('WebSocket error:', err); };
      }, () => { this.isLoadingUpgrade = false; });
    },
    shareGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      const message = `I recommend checking out "${this.displayName}" NFT.`;
      TelegramModule.useShare(url, message);
    },
    copyGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      copyToClipboard(url);
      showToast(this.$t('profile.profileCopiedLink'), 'success');
    },
    setActiveTransferTab(value) {
      this.transferSections.active.label = this.transferSections.items.find(item => item.value === value).label;
      this.transferSections.active.value = value;
      this.transferUsers = []; this.transferUserSelected = null; this.isTransferInputSuccess = false; this.clearTransferData();
    },
    selectTransferUser(user) {
      this.transferUserSelected = user.user_id;
      this.transferData.userId = Number(user.user_id);
      this.transferData.avatar = user.user_photo;
      this.transferData.name = user.name;
      this.transferData.success = true;
      this.$refs.transferInput?.blur();
      this.isTransferInputSuccess = true;
      document.removeEventListener('click', this.handleClickOutside);
    },
    onTouchStart(e) {
      if (!this.isVisible) return;
      const t = e.touches?.[0] ?? e;
      this.isDragging = true; this.startY = t.clientY; this.startX = t.clientX; this.dragY = 0; this.startTimeMs = performance.now();
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
      if (distance > 120 || distance / elapsed > 0.6) this.closeModal(); else this.dragY = 0;
    },
    sellGift() {
      if (!this.ModalComp.NftUpgraded) return;
      this.closeModal();
      const obj = { ton_price: 0, gift_media: this.ModalComp.NftMedia, gift_ukey: this.ModalComp.NftUniqueKey, gift_uuid: this.ModalComp.NftUuid, ...this.ModalComp.NftUpgraded };
      this.$emit('openSellModal', obj);
    },
    async removeGiftLot() {
      if (!this.ModalComp.Market?.LotId) return;
      const res = await MarketLotsApi.remove(this.ModalComp.Market.LotId);
      if (!res) return;
      this.$emit('removeGiftLot', this.ModalComp.NftUuid);
      this.closeModal();
    },
  },
};
</script>

<style lang="sass" scoped>
@use "../Market/Modal.sass"
@use "../Profile/ProfileGiftModal.sass"
@use "@/assets/styles/_variables" as *

// Герой только этой модалки. Базовая геометрия из Market/Modal.sass — карточка
// 280px, модель 46% на 35% высоты — оставляла под подарком ~120px пустоты.
// Класс .vgm-modal есть только здесь, модалка профиля и маркета не затронуты.
.vgm-modal .mgm-card
    height: 236px

    &__head
        height: 236px

    // символы стояли боксом 84% высоты на top: 36% — он вылезал за верх
    // карточки на 14px и обрезался. растягиваем на всю карточку и центрируем
    &__symbol
        top: 50%
        left: 50%
        width: 100%
        height: 100%

        // cover обрезал узор по краям — contain вписывает его целиком,
        // 84% дают запас по краям, чтобы плитки не упирались в рамку
        img
            width: 84%
            height: 84%
            object-fit: contain

    // 62% и ровно по центру: сверху и снизу по 45px
    &__model
        top: 50%
        width: 62%
        height: 62%
</style>
