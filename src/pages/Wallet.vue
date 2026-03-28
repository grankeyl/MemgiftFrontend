<template>
    <div class="overlay" :class="{ 'is-open is-dark': DepositModal.Active }" @click="DepositModal.Active = false" />
    <div class="overlay" :class="{ 'is-open is-dark': WithdrawModal.Active }" @click="WithdrawModal.Active = false" />

    <div class="_wrap wallet" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <div class="bg">
                <div class="_wl-orb _wl-orb--1"></div>
                <div class="_wl-orb _wl-orb--2"></div>
                <div class="_wl-orb _wl-orb--3"></div>
            </div>

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

            <div class="display">
                <!-- Header -->
                <div class="wl-header _lefting">
                    <div class="wl-header__left">
                        <h2>{{ $t('wallet.pageTitle') }}</h2>
                    </div>
                    <button class="wl-header__back" @click="backToHome">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-7 7 7M5 8v8a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span>{{ $t('wallet.back') }}</span>
                    </button>
                </div>

                <!-- Balance block -->
                <div class="_direction _comp _item wl-balance _lefting">
                    <div class="_content">
                        <div class="wl-balance__block">
                            <div class="wl-balance__wallet" v-if="walletConnected">
                                <div class="wl-balance__dot wl-balance__dot--on"></div>
                                <p>{{ obfuscateAddress(walletAddress) }}</p>
                                <span class="wl-balance__disconnect" @click="disconnectTonWallet">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.5 2.5l-5 5m0-5l5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                                </span>
                            </div>
                            <div class="wl-balance__wallet" v-else>
                                <div class="wl-balance__dot wl-balance__dot--off"></div>
                                <p>{{ $t('wallet.walletNotConnected') }}</p>
                                <button class="wl-balance__connect" @click="openTonWallet">{{ $t('wallet.connect') }}</button>
                            </div>
                            <div class="wl-balance__amount">
                                <h1>{{ cutNumber(getBalance) }}</h1>
                                <img :src="TonImg" alt="ton" />
                            </div>
                            <div class="wl-balance__buttons">
                                <button @click="openDeposit">
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    <h4>{{ $t('wallet.deposit') }}</h4>
                                </button>
                                <button @click="openWithdraw">
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M16 10l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    <h4>{{ $t('wallet.withdraw') }}</h4>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History title -->
                <div class="_direction _comp _item _title _lefting wl-title-block">
                    <div class="_content">
                        <div class="_text"><h4>{{ $t('wallet.historyTitle') }}</h4></div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="wl-tabs _lefting">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        class="wl-tabs__item"
                        :class="{ active: activeTab === tab.id }"
                        @click="activeTab = tab.id"
                    >{{ tab.label }}</button>
                </div>

                <!-- History list -->
                <div class="wl-card _lefting" v-if="filteredHistory.length > 0">
                    <div
                        v-for="(item, idx) in filteredHistory"
                        :key="item.timestamp || idx"
                        class="wl-row"
                        :class="{ 'wl-row--last': idx === filteredHistory.length - 1 }"
                        @click="onHistoryItemClick(item)"
                    >
                        <div class="wl-row__icon" :class="'wl-row__icon--' + item.type">
                            <img v-if="item.image" :src="item.image" alt="" />
                            <svg v-else-if="item.type === 'deposit'" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <svg v-else-if="item.type === 'withdraw'" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M16 10l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/></svg>
                        </div>
                        <div class="wl-row__body">
                            <div class="wl-row__info">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.time }}</p>
                            </div>
                            <div class="wl-row__amount" :class="{ 'wl-row__amount--plus': item.amount > 0, 'wl-row__amount--minus': item.amount < 0 }">
                                <span v-if="item.amountDisplay">{{ item.amountDisplay }}</span>
                                <span v-else>{{ item.amount > 0 ? '+' : '' }}{{ cutNumber(item.amount) }} TON</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty -->
                <div class="wl-card wl-card--empty _lefting" v-else>
                    <div class="wl-empty">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/></svg>
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

import * as walletApi from '../api/walletApi';
import * as historyApi from '../api/historyApi';

import DepositModal from '../components/Wallet/DepositModal.vue';
import WithdrawModal from '../components/Wallet/WithdrawModal.vue';

import TonImg from '@/assets/images/market/ton.svg';

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
    },

    data() {
        return {
            TonImg,
            storeCache: useCacheStore() as any,
            configApp: getConfig(),
            isPageLoading: true,

            DepositModal: { Active: false },
            WithdrawModal: { Active: false },

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
            return history.map((h: any) => ({
                type: 'gift',
                title: h.gift_name || 'Gift',
                image: h.gift_image || '',
                rarity: h.gift_rarity || '',
                time: this.unixToRelative(h.created_at),
                timestamp: h.created_at ? (h.created_at < 1e12 ? h.created_at * 1000 : h.created_at) : 0,
                amount: -(h.purchase_price || 0),
                amountDisplay: h.status === 'purchased'
                    ? (h.purchase_price ? `-${cutNumber(h.purchase_price)} ★` : t('wallet.historyFree'))
                    : (h.status === 'transferred' ? t('wallet.historyTransfer') : ''),
                status: h.status,
                uKey: h.u_key,
            }));
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
        TelegramModule.useBackButton(() => this.$router.push('/'));
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

        disconnectTonWallet() {
            this.walletConnected = false;
            this.walletAddress = '';
            tonConnectUI.disconnect();
        },

        backToHome() {
            this.$router.push('/');
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
    },
};
</script>

<style lang="sass">
@use "@/assets/styles/wallet/_main.sass"
@use "@/assets/styles/wallet/_comp.sass"
</style>
