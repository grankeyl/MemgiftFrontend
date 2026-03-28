<template>
  <div class="_direction _comp _item _user" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_image"></div>
          <div class="_name"></div>
          <div class="_descr"></div>
      </div>
      <div v-else class="_content">
          <!-- Floating controls -->
          <div class="pu-ctrl">
            <div class="pu-ctrl__lang" @click="openLanguageModal">
              <span>{{ getLanguageFlag }}</span>
              <div class="pu-ctrl__dd" :class="{ open: LanguageModalActive }" @click.stop>
                <div v-for="lang in LanguageList" :key="lang.id" class="pu-ctrl__dd-item" @click.stop="selectLanguage(lang.id)">
                  <span>{{ lang.flag }}</span>
                  <p>{{ lang.title }}</p>
                </div>
              </div>
            </div>
            <div class="pu-ctrl__tickets">
              <img :src="Image_Ticket" alt="ticket" />
              <span>{{ storeCache.UserData.user.Tickets || 0 }}</span>
            </div>
            <div class="pu-ctrl__bal" @click="openWallet">
              <span>{{ cutNumber(getBalance.toString()) }}</span>
              <img :src="TonImg" alt="ton" />
            </div>
          </div>

          <!-- Avatar -->
          <div class="pu-ava">
            <div v-if="UserImage && UserAvatar" class="pu-ava__img" :class="{ _loading: UserAvatarLoading }">
              <img @load="UserAvatarLoading = false" @error="UserAvatar = false" :src="UserImage" alt="avatar" />
              <Lottie class="lt" slug="loading-spin" :loop="true" width="75" height="75" renderer="svg" />
            </div>
            <div v-else class="pu-ava__img">
              <div class="pu-ava__null">
                <h4 v-if="UserName">{{ UserName[0] }}</h4>
                <h4 v-else>?</h4>
              </div>
            </div>
          </div>

          <!-- Name -->
          <h2 class="pu-name">{{ UserName || 'No Name' }}</h2>

          <!-- Sub-line: rank + gifts count + id copy -->
          <div class="pu-meta">
            <span v-if="UserRank" class="pu-meta__rank">#{{ UserRank }}</span>
            <span class="pu-meta__dot">·</span>
            <span class="pu-meta__gifts">{{ UserNftsCount }} {{ pluralizeGift($t('app.sendGiftText'), UserNftsCount, storeCache.TelegramData.user.language) }}</span>
            <span class="pu-meta__dot">·</span>
            <span class="pu-meta__id" @click="copyUserId()">{{ storeCache.UserData.user.Tld }}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2.5"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2.5"/></svg>
            </span>
          </div>

          <!-- Wallet -->
          <div v-if="!walletConnected" class="pu-wallet" @click="openTonWallet()">
            <img src="/profile/ton-lig.svg" alt="ton" />
            <span>{{ $t('profile.profileConnect') }}</span>
          </div>
          <div v-else class="pu-wallet pu-wallet--on" @click="openDisconnectModal()">
            <img src="/profile/ton-lig.svg" alt="ton" />
            <span>{{ obfuscateAddress(walletAddress) }}</span>
          </div>
      </div>
  </div>

  <!-- Actions -->
  <div class="_direction _comp _item _funcers">
    <div v-if="!isLoading" class="prf-acts">
      <div class="prf-acts__row" @click="openMulticheck">
        <div class="prf-acts__ic" v-html="Icon.Friends"></div>
        <span class="prf-acts__txt">{{ $t('profile.profileCreateMulticheck') }}</span>
        <span class="prf-acts__new">{{ $t('app.newMark') }}</span>
        <svg class="prf-acts__arr" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="prf-acts__row" @click="openPrivateDeal">
        <div class="prf-acts__ic" v-html="Icon.Shield"></div>
        <span class="prf-acts__txt">{{ $t('profile.profileCreatePrivateDeal') }}</span>
        <span class="prf-acts__new">{{ $t('app.newMark') }}</span>
        <svg class="prf-acts__arr" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="prf-acts__row prf-acts__row--last" @click="openReferrals">
        <div class="prf-acts__ic" v-html="Icon.Reward"></div>
        <span class="prf-acts__txt">{{ $t('profile.profileReferralProgram') }}</span>
        <svg class="prf-acts__arr" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { getConfig } from '../../config';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { useToast } from 'vue-toast-notification';
import { Icon } from '../Icon';
import { obfuscateAddress } from '@/utils/useApp';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { toUserFriendlyAddress } from 'ton-ui-vue';
import { pluralizeGift } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { cutNumber } from '../../utils/useTon';

import * as walletApi from '../../api/walletApi';
import * as settingsApi from '../../api/settingsApi';

import TelegramModule from '../../hooks/useTelegram';
import Lottie from '../Lottie.vue';

import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import i18next from 'i18next';

import TonImg from '@/assets/images/market/ton.svg';
import PlusImg from '@/assets/images/market/plus.svg';

export default {
  setup() {
    const walletConnected = ref(false);
    const walletAddress = ref('');

    const openTonWallet = () => {
      tonConnectUI.openModal();
      TelegramModule.useMediumHaptic();
      const interval = setInterval(async () => {
        if (tonConnectUI.connected) {
          clearInterval(interval);
          walletConnected.value = true;
          const addr = getTonWalletAddress();
          const response = await walletApi.create(addr);
          if (response && response.WalletAddress) {
            showToast('Wallet connected', 'success');
          } else {
            clearInterval(interval);
            showToast('Wallet not connected', 'error');
          }
        }
      }, 1000);
    }

    const checkTonWallet = () => { walletConnected.value = tonConnectUI.connected; }

    const getTonWalletAddress = () => {
      if (!tonConnectUI.account) return;
      const raw = tonConnectUI.account.address;
      const friendly = toUserFriendlyAddress(raw);
      walletAddress.value = friendly;
      return friendly;
    }

    const disconnectTonWallet = () => {
      walletConnected.value = false;
      tonConnectUI.disconnect();
    }

    getTonWalletAddress();
    checkTonWallet();
    setInterval(checkTonWallet, 1000);
    
    return { tonConnectUI, openTonWallet, walletConnected, disconnectTonWallet, walletAddress };
  },

  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    UserImage: { type: String, required: true },
    UserName: { type: String, required: true },
    UserNftsCount: { type: Number, required: true },
    UserRank: { type: Number, required: true },
  },

  components: { Lottie },

  data() {
    return {
      TonImg, PlusImg, Image_Ticket,
      configApp: getConfig(),
      storeCache: useCacheStore(),
      isLoading: false,
      LanguageSelect: 'en',
      LanguageList: [
        { id: 'en', flag: '🇬🇧', title: 'English' },
        { id: 'ru', flag: '🇷🇺', title: 'Русский' },
        { id: 'zh', flag: '🇨🇳', title: '中文' },
        { id: 'ar', flag: '🇸🇦', title: 'العربية' },
      ],
      LanguageModalActive: false,
      UserAvatarLoading: true,
      UserAvatar: true,
      Icon, obfuscateAddress, pluralizeGift, cutNumber,
    };
  },

  mounted() {
    this.getTickets();
    this.LanguageSelect = this.storeCache.UserData.user.Language;
    this.$watch(() => this.storeCache.TelegramData, () => this.getTickets());
  },

  computed: {
    getLanguageFlag() {
      if (!this.storeCache.UserData.user.Language) return '🌐';
      return this.LanguageList.find(l => l.id === this.storeCache.UserData.user.Language)?.flag ?? '🌐';
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },
  
  methods: {
    openLanguageModal() { this.LanguageModalActive = !this.LanguageModalActive; },
    async selectLanguage(lang) {
      this.LanguageModalActive = false;
      const set = await settingsApi.set(lang);
      if (set.ok) { this.storeCache.UserData.user.Language = lang; i18next.changeLanguage(lang); }
    },
    async getTickets() {
      try { this.storeCache.UserData.user.Tickets = this.storeCache.UserData.user.Tickets || 0; } catch {}
    },
    loadFonts() { return document.fonts.ready; },
    loadImages() {
      return Promise.all([Image_Avatar].map(src => new Promise((res, rej) => {
        const img = new Image(); img.src = src; img.onload = res; img.onerror = rej;
      })));
    },
    openDisconnectModal() { this.$emit('openDisconnectModal'); },
    openReferrals() { this.$router.push({ name: 'referral' }); },
    openMulticheck() { this.$router.push('/multicheck'); },
    openPrivateDeal() { this.$router.push('/private-deal'); },
    copyUserId() { copyToClipboard(this.storeCache.UserData.user.Tld); showToast('Copied', 'success'); },
    openWallet() { this.$router.push('/wallet'); },
  },
};
</script>
