<template>
  <div class="_wrap wallet" :class="{ desktop: isDesktop() }">

    <!-- Outside ._view stacking context — modals teleport to body too -->
    <DepositModal
      @deposit="onDeposit"
      @closeModal="DepositModal.Active = false"
      :Skeleton="isPageLoading"
      :SkeletonTime="configApp.skeletonTime"
      :ModalActive="DepositModal.Active"
    />

    <WithdrawModal
      @withdraw="onWithdraw"
      @closeModal="WithdrawModal.Active = false"
      :Skeleton="isPageLoading"
      :SkeletonTime="configApp.skeletonTime"
      :ModalActive="WithdrawModal.Active"
    />

    <DisconnectModal
      @disconnected="onWalletDisconnected"
      @closeModal="DisconnectModal.Active = false"
      :Skeleton="isPageLoading"
      :SkeletonTime="configApp.skeletonTime"
      :ModalActive="DisconnectModal.Active"
    />

    <div class="_view">
      <div class="display">
        <!-- Balance hero -->
        <div class="wl-hero">
          <div class="wl-hero__wallet wl-hero__wallet--on" v-if="walletConnected">
            <span class="wl-hero__addr">{{ obfuscateAddress(walletAddress) }}</span>
            <button
              type="button"
              class="wl-hero__disconnect"
              @click.stop="DisconnectModal.Active = true"
              aria-label="Disconnect"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="wl-hero__wallet" v-else>
            <span class="wl-hero__addr">{{ $t('wallet.walletNotConnected') }}</span>
            <button type="button" class="wl-hero__connect" @click="openTonWallet">
              {{ $t('wallet.connect') }}
            </button>
          </div>

          <div class="wl-hero__amount">
            <h1>{{ cutNumber(getBalance) }}</h1>
            <div class="kit-icon" v-html="Icon.Gram"></div>
          </div>
          <p class="wl-hero__label">Gram</p>

          <div class="wl-actions">
            <button type="button" class="wl-actions__btn" @click="openDeposit">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ $t('wallet.deposit') }}</span>
            </button>
            <button type="button" class="wl-actions__btn" @click="openWithdraw">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 16V4M16 10l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ $t('wallet.withdraw') }}</span>
            </button>
          </div>
        </div>

        <!-- History -->
        <div class="wl-hist">
          <div class="wl-hist__head">
            <h4>{{ $t('wallet.historyTitle') }}</h4>
          </div>

          <!-- Filter chips like market/profile -->
          <div class="wl-filters">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="wl-filters__item"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span class="wl-filters__title">{{ tab.label }}</span>
            </button>
          </div>

          <!-- Flat list like Market/Listings.vue -->
          <div class="wl-list" v-if="filteredHistory.length > 0">
            <div
              v-for="(item, idx) in filteredHistory"
              :key="item.timestamp || idx"
              class="item"
              @click="onHistoryItemClick(item)"
            >
              <div class="nft" :class="'nft--' + item.type">
                <img v-if="item.image" :src="item.image" alt="" />
                <svg v-else-if="item.type === 'deposit'" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="item.type === 'withdraw'" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 16V4M16 10l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>

              <div class="mid">
                <div class="title-row">
                  <h4 class="name">{{ item.title }}</h4>
                </div>
                <div class="meta-row">
                  <span class="time">{{ item.time }}</span>
                  <template v-if="priceText(item)">
                    <span class="dot">·</span>
                    <span
                      class="price"
                      :class="{
                        'is-plus': Number(item.amount) > 0,
                        'is-minus': Number(item.amount) < 0,
                      }"
                    >{{ priceText(item) }}</span>
                  </template>
                </div>
              </div>

              <div class="right">
                <span class="status" :class="'is-' + statusKey(item)">{{ statusLabel(item) }}</span>
              </div>
            </div>
          </div>

          <div class="wl-empty" v-else>
            <p>{{ $t('wallet.historyEmpty') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { getConfig } from '../config';
import { cutNumber } from '../utils/useTon';
import { obfuscateAddress } from '@/utils/useApp';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { toUserFriendlyAddress } from 'ton-ui-vue';
import { showToast } from '../utils/toastManager';
import { t } from 'i18next';
import { Icon } from '../components/Icon';

import * as walletApi from '../api/walletApi';
import * as historyApi from '../api/historyApi';

import DepositModal from '../components/Wallet/DepositModal.vue';
import DisconnectModal from '../components/Profile/DisconnectModal.vue';
import WithdrawModal from '../components/Wallet/WithdrawModal.vue';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    DepositModal,
    WithdrawModal,
    DisconnectModal,
  },

  data() {
    return {
      Icon,
      storeCache: useCacheStore() as any,
      configApp: getConfig(),
      isPageLoading: true,

      DepositModal: { Active: false },
      WithdrawModal: { Active: false },

      DisconnectModal: { Active: false },

      walletConnected: false,
      walletAddress: '',

      activeTab: 'all',
      localTransactions: [] as any[],

      isDesktop,
      cutNumber,
      obfuscateAddress,
      _walletTimer: null as any,
    };
  },

  computed: {
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },

    tabs() {
      return [
        { id: 'all', label: t('wallet.tabAll') },
        { id: 'gift', label: t('wallet.tabGifts') },
        { id: 'deposit', label: t('wallet.tabDeposits') },
        { id: 'withdraw', label: t('wallet.tabWithdrawals') },
      ];
    },

    giftHistory(): any[] {
      const history = this.storeCache.HistoryApp || [];
      return history.map((h: any) => {
        const isFree = h.status === 'purchased' && !h.purchase_price;
        const isTransfer = h.status === 'transferred';
        return {
          type: 'gift',
          title: h.gift_name || 'Gift',
          image: h.gift_image || '',
          rarity: h.gift_rarity || '',
          time: this.unixToRelative(h.created_at),
          timestamp: h.created_at ? (h.created_at < 1e12 ? h.created_at * 1000 : h.created_at) : 0,
          amount: h.purchase_price ? -Number(h.purchase_price) : 0,
          // only numeric amount — status text lives in the chip only
          amountDisplay: h.purchase_price ? `-${cutNumber(h.purchase_price)} ★` : '',
          status: h.status,
          statusKind: isTransfer ? 'transfer' : (isFree ? 'free' : 'gift'),
          uKey: h.u_key,
        };
      });
    },

    filteredHistoryAll(): any[] {
      const all = [...this.localTransactions, ...this.giftHistory];
      all.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      return all;
    },

    filteredHistory(): any[] {
      if (this.activeTab === 'all') return this.filteredHistoryAll;
      return this.filteredHistoryAll.filter((item: any) => item.type === this.activeTab);
    },
  },

  mounted() {
    TelegramModule.useBackButton(() => this.$router.push('/profile'));
    this.checkTonWallet();
    this.getTonWalletAddress();
    this._walletTimer = setInterval(() => this.checkTonWallet(), 2000);
    this.loadData();
    this.loadLocalTransactions();
  },

  beforeUnmount() {
    clearInterval(this._walletTimer);
  },

  methods: {
    async loadData() {
      try {
        const historyGet = await historyApi.getAll();
        if (historyGet) {
          this.storeCache.HistoryApp = historyGet;
        }
      } catch (e) { /* ignore */ }
      this.isPageLoading = false;
    },

    loadLocalTransactions() {
      try {
        const saved = localStorage.getItem('wallet_transactions');
        if (saved) this.localTransactions = JSON.parse(saved);
      } catch { /* ignore */ }
    },

    saveLocalTransaction(tx: any) {
      this.localTransactions.unshift(tx);
      try {
        localStorage.setItem('wallet_transactions', JSON.stringify(this.localTransactions.slice(0, 50)));
      } catch { /* ignore */ }
    },

    checkTonWallet() {
      this.walletConnected = !!tonConnectUI.connected;
      if (this.walletConnected && !this.walletAddress) this.getTonWalletAddress();
    },

    getTonWalletAddress() {
      if (!tonConnectUI.account) return;
      const raw = tonConnectUI.account.address;
      const friendly = toUserFriendlyAddress(raw);
      this.walletAddress = friendly;
    },

    openTonWallet() {
      tonConnectUI.openModal();
      TelegramModule.useMediumHaptic();
      const interval = setInterval(async () => {
        if (tonConnectUI.connected) {
          clearInterval(interval);
          this.walletConnected = true;
          this.getTonWalletAddress();
          const response = await walletApi.create(this.walletAddress);
          if (response?.WalletAddress) {
            showToast('Wallet connected', 'success');
          }
        }
      }, 1000);
    },

    // отвязка теперь идёт через модалку — здесь только чистим состояние страницы
    onWalletDisconnected() {
      this.walletConnected = false;
      this.walletAddress = '';
    },

    disconnectTonWallet() {
      this.walletConnected = false;
      this.walletAddress = '';
      tonConnectUI.disconnect();
    },

    backToHome() {
      this.$router.push('/profile');
    },

    openDeposit() {
      this.DepositModal.Active = true;
    },

    openWithdraw() {
      this.WithdrawModal.Active = true;
    },

    onDeposit(amount: any) {
      this.DepositModal.Active = false;
      const num = parseFloat(amount);
      if (this.storeCache?.UserData?.user?.Balance) {
        this.storeCache.UserData.user.Balance.balance_ton =
          parseFloat(this.storeCache.UserData.user.Balance.balance_ton) + num;
      }

      this.saveLocalTransaction({
        type: 'deposit',
        title: t('wallet.deposit') + ' TON',
        time: this.formatNow(),
        amount: num,
        amountDisplay: `+${cutNumber(String(num))} TON`,
        timestamp: Date.now(),
      });
    },

    onWithdraw() {
      this.WithdrawModal.Active = false;
    },

    onHistoryItemClick(item: any) {
      if (item.uKey) {
        this.$router.push(`/gift/${item.uKey}`);
      }
    },

    unixToRelative(unix: number): string {
      if (!unix) return '';
      const now = Date.now();
      const ts = unix < 1e12 ? unix * 1000 : unix;
      const diff = now - ts;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return t('wallet.justNow');
      if (mins < 60) return `${mins}m`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      return `${days}d`;
    },

    formatNow(): string {
      return t('wallet.justNow');
    },

    statusKey(item: any): string {
      if (item.statusKind) return item.statusKind;
      if (item.type === 'deposit') return 'deposit';
      if (item.type === 'withdraw') return 'withdraw';
      if (item.status === 'transferred') return 'transfer';
      if (item.status === 'purchased' && !item.amount) return 'free';
      if (item.type === 'gift') return 'gift';
      return 'default';
    },

    statusLabel(item: any): string {
      const key = this.statusKey(item);
      switch (key) {
        case 'deposit': return t('wallet.statusDeposit');
        case 'withdraw': return t('wallet.statusWithdraw');
        case 'gift': return t('wallet.statusGift');
        case 'transfer': return t('wallet.statusTransfer');
        case 'free': return t('wallet.statusFree');
        default: return t('wallet.tabAll');
      }
    },

    /** Only numeric money strings — never Free/Transfer status words */
    priceText(item: any): string {
      const display = item.amountDisplay != null ? String(item.amountDisplay).trim() : '';
      if (display && /[0-9]/.test(display)) return display;
      const n = Number(item.amount);
      if (!Number.isFinite(n) || n === 0) return '';
      if (n > 0) return `+${cutNumber(String(n))} TON`;
      return `-${cutNumber(String(Math.abs(n)))} TON`;
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/wallet/_main.sass"
@use "@/assets/styles/wallet/_comp.sass"
</style>
