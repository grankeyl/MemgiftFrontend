<template>
  <div class="_direction _comp _item _user" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_ctrl-skel">
              <div class="_lang-skel _shine"></div>
              <div class="_balances-skel">
                  <div class="_balance-skel _shine"></div>
                  <div class="_balance-skel _shine"></div>
              </div>
          </div>
          <div class="_image _shine"></div>
          <div class="_name _shine"></div>
          <div class="_descr _shine"></div>
          <div class="_wallet-skel _shine"></div>
      </div>
      <div v-else class="_content">
          <!-- Floating controls: lang left · tickets + gram right (like tickets page) -->
          <div class="pu-ctrl">
            <button type="button" class="pu-ctrl__lang" @click="openLanguageModal">
              <span>{{ getLanguageFlag }}</span>
              <div class="pu-ctrl__dd" :class="{ open: LanguageModalActive }" @click.stop>
                <div v-for="lang in LanguageList" :key="lang.id" class="pu-ctrl__dd-item" @click.stop="selectLanguage(lang.id)">
                  <span>{{ lang.flag }}</span>
                  <p>{{ lang.title }}</p>
                </div>
              </div>
            </button>

            <!-- Same as tickets page .balances — no chips -->
            <div class="pu-ctrl__balances">
              <div class="pu-ctrl__balance">
                <div class="kit-icon ticket" v-html="Icon.Ticket"></div>
                <span>{{ storeCache.UserData.user.Tickets || 0 }}</span>
              </div>
              <button type="button" class="pu-ctrl__balance" @click="openWallet">
                <div class="kit-icon" v-html="Icon.Gram"></div>
                <span>{{ cutNumber(getBalance.toString()) }}</span>
              </button>
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
            <span class="pu-meta__gifts">{{ UserNftsCount }} {{ pluralizeGift($t('app.sendGiftText'), UserNftsCount, storeCache.TelegramData.user.language) }}</span>
            <span class="pu-meta__dot">·</span>
            <span class="pu-meta__id" @click="copyUserId()">{{ storeCache.UserData.user.Tld }}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2.5"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2.5"/></svg>
            </span>
          </div>

          <!-- Wallet — Gram CTA (market-style pill) -->
          <button
            v-if="!walletConnected"
            type="button"
            class="pu-wallet"
            @click="openTonWallet()"
          >
            <div class="kit-icon" v-html="Icon.Gram"></div>
            <span>{{ $t('profile.profileConnect') }}</span>
          </button>
          <button
            v-else
            type="button"
            class="pu-wallet pu-wallet--on"
            @click="openDisconnectModal()"
          >
            <div class="kit-icon" v-html="Icon.Gram"></div>
            <span>{{ walletAddressLabel }}</span>
          </button>
      </div>
  </div>

  <!-- Actions blocks -->
  <div class="_direction _comp _item _funcers">
    <div v-if="isLoading" class="prf-acts prf-acts--skel">
      <div class="prf-acts__item" v-for="i in 3" :key="i">
        <div class="prf-acts__text">
          <div class="_title-skel _shine"></div>
        </div>
        <div class="_go-skel _shine"></div>
      </div>
    </div>

    <div v-else class="prf-acts">
      <button type="button" class="prf-acts__item" @click="openWallet">
        <div class="prf-acts__text">
          <div class="prf-acts__line">
            <span class="prf-acts__title">{{ $t('profile.profileWallet') }}</span>
          </div>
        </div>
        <span class="prf-acts__go" aria-hidden="true">
          <svg viewBox="0 0 8 14" fill="none">
            <path d="M1 1.5L6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <!-- мультичек временно отключён. вернуть — снять комментарий,
           метод openMulticheck и роут /multicheck на месте
      <button type="button" class="prf-acts__item" @click="openMulticheck">
        <div class="prf-acts__text">
          <div class="prf-acts__line">
            <span class="prf-acts__title">{{ $t('profile.profileCreateMulticheck') }}</span>
          </div>
        </div>
        <span class="prf-acts__go" aria-hidden="true">
          <svg viewBox="0 0 8 14" fill="none">
            <path d="M1 1.5L6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      -->

      <button type="button" class="prf-acts__item" @click="openReferrals">
        <div class="prf-acts__text">
          <div class="prf-acts__line">
            <span class="prf-acts__title">{{ $t('profile.profileReferralProgram') }}</span>
          </div>
        </div>
        <span class="prf-acts__go" aria-hidden="true">
          <svg viewBox="0 0 8 14" fill="none">
            <path d="M1 1.5L6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
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
import i18next from 'i18next';


export default {
  setup() {
    const walletConnected = ref(false);
    const walletAddress = ref('');
    let walletPoll = null;

    const getTonWalletAddress = () => {
      if (!tonConnectUI.account?.address) return '';
      try {
        const friendly = toUserFriendlyAddress(tonConnectUI.account.address);
        if (friendly) walletAddress.value = friendly;
        return friendly || '';
      } catch {
        return walletAddress.value || '';
      }
    };

    const checkTonWallet = () => {
      const connected = !!tonConnectUI.connected;
      walletConnected.value = connected;
      if (connected) {
        // Account can arrive slightly after `connected` — keep refreshing until we have it
        if (!walletAddress.value || tonConnectUI.account?.address) {
          getTonWalletAddress();
        }
      } else if (walletAddress.value) {
        walletAddress.value = '';
      }
    };

    const openTonWallet = () => {
      tonConnectUI.openModal();
      TelegramModule.useMediumHaptic();
      const interval = setInterval(async () => {
        if (tonConnectUI.connected) {
          clearInterval(interval);
          walletConnected.value = true;
          const addr = getTonWalletAddress();
          if (!addr) return;
          try {
            const response = await walletApi.create(addr);
            if (response && response.WalletAddress) {
              showToast('Wallet connected', 'success');
            } else {
              showToast('Wallet not connected', 'error');
            }
          } catch {
            showToast('Wallet not connected', 'error');
          }
        }
      }, 1000);
    };

    const disconnectTonWallet = () => {
      walletConnected.value = false;
      walletAddress.value = '';
      tonConnectUI.disconnect();
    };

    checkTonWallet();
    walletPoll = setInterval(checkTonWallet, 800);

    // Prefer status subscription when available (clears empty address while account hydrates)
    let unsubscribeStatus = null;
    try {
      if (typeof tonConnectUI.onStatusChange === 'function') {
        unsubscribeStatus = tonConnectUI.onStatusChange(() => {
          checkTonWallet();
        });
      }
    } catch { /* ignore */ }

    return {
      tonConnectUI,
      openTonWallet,
      walletConnected,
      disconnectTonWallet,
      walletAddress,
      _walletPoll: walletPoll,
      _unsubscribeStatus: unsubscribeStatus,
    };
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

  beforeUnmount() {
    if (this._walletPoll) clearInterval(this._walletPoll);
    if (typeof this._unsubscribeStatus === 'function') {
      try { this._unsubscribeStatus(); } catch { /* ignore */ }
    }
  },

  computed: {
    getLanguageFlag() {
      if (!this.storeCache.UserData.user.Language) return '🌐';
      return this.LanguageList.find(l => l.id === this.storeCache.UserData.user.Language)?.flag ?? '🌐';
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
    walletAddressLabel() {
      const label = obfuscateAddress(this.walletAddress);
      // Avoid "..." for empty — show neutral placeholder until account hydrates
      return label || 'TON';
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
    openRating() { this.$router.push({ name: 'rating' }); },
    openMulticheck() { this.$router.push('/multicheck'); },
    openPrivateDeal() { this.$router.push('/private-deal'); },
    copyUserId() { copyToClipboard(this.storeCache.UserData.user.Tld); showToast('Copied', 'success'); },
    openWallet() { this.$router.push('/wallet'); },
  },
};
</script>
