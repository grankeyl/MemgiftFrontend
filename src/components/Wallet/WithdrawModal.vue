<template>
  <Teleport to="body">
    <div
      class="wmod-overlay"
      :class="{ 'is-open': ModalActive }"
      @click="closeModal"
    />

    <div
      class="wmod-dock"
      :class="{ open: ModalActive && !isLoading, hide: !ModalActive || isLoading }"
    >
      <div class="wmod-sheet" @click.stop>
        <div class="wmod-sheet__handle"></div>
        <button type="button" class="wmod-close" @click="closeModal" aria-label="Close">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </button>

        <div class="wmod-head">
          <h3>{{ $t('wallet.withdrawModal.title') }}</h3>
        </div>

        <div v-if="walletConnected" class="wmod-wallet">
          <span class="wmod-wallet__addr">{{ obfuscateAddress(walletAddress) }}</span>
        </div>
        <button v-else type="button" class="wmod-wallet wmod-wallet--cta" @click="openTonWallet">
          <span>{{ $t('wallet.connect') }}</span>
        </button>

        <div class="wmod-amount">
          <span class="wmod-amount__val">{{ amountStr || '0' }}</span>
          <span class="wmod-amount__unit">TON</span>
        </div>
        <p class="wmod-balance">
          {{ $t('wallet.balanceLabel') }} · {{ cutNumber(getBalance) }} TON
        </p>

        <div class="wmod-pad" role="group" aria-label="Keypad">
          <button type="button" v-for="n in [1,2,3,4,5,6,7,8,9]" :key="'w'+n" @click="tap(n)">{{ n }}</button>
          <button type="button" @click="tap('.')">.</button>
          <button type="button" @click="tap(0)">0</button>
          <button type="button" class="wmod-pad__back" @click="backspace" aria-label="Backspace">
            <img :src="DeleteAmImg" alt="" />
          </button>
        </div>

        <p class="wmod-info">{{ $t('wallet.withdrawModal.info') }}</p>

        <button
          type="button"
          class="wmod-submit"
          :disabled="!checkBalanceAndPrice || loadingButton"
          @click="withdraw"
        >
          <span v-if="amountNum > 0">{{ $t('wallet.withdraw') }} {{ cutNumber(amountNum) }} TON</span>
          <span v-else>{{ $t('wallet.withdraw') }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { Icon } from '../Icon';
import { obfuscateAddress } from '@/utils/useApp';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { toUserFriendlyAddress } from 'ton-ui-vue';
import { showToast } from '../../utils/toastManager';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { cutNumber } from '../../utils/useTon';
import { t } from 'i18next';
import TelegramModule from '../../hooks/useTelegram';

import * as MarketBalanceApi from '../../api/market/balance';

import DeleteAmImg from '@/assets/images/market/delete-am.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
  },

  data() {
    return {
      DeleteAmImg,
      storeCache: useCacheStore(),
      isLoading: true,
      amountStr: '1',
      loadingButton: false,
      walletConnected: false,
      walletAddress: '',
      Icon,
      cutNumber,
      obfuscateAddress,
      _walletTimer: null,
    };
  },

  computed: {
    amountNum() {
      const n = parseFloat(String(this.amountStr).replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
    checkBalanceAndPrice() {
      if (!this.amountNum) return false;
      if (this.amountNum < 0.05) return false;
      if (this.amountNum > 15000) return false;
      if (!this.storeCache.UserData?.user?.Balance) return false;
      return parseFloat(this.storeCache.UserData.user.Balance.balance_ton) >= parseFloat(this.amountNum);
    },
  },

  mounted() {
    this.loadResources();
    this.getTonWalletAddress();
    this.checkTonWallet();
    this._walletTimer = setInterval(this.checkTonWallet, 1000);
  },

  beforeUnmount() {
    clearInterval(this._walletTimer);
  },

  methods: {
    async loadResources() {
      try {
        await document.fonts.ready;
      } catch {}
      this.isLoading = false;
      this.$emit('loadSuccess');
    },

    closeModal() {
      this.$emit('closeModal');
    },

    tap(val) {
      const s = String(this.amountStr);
      if (val === '.') {
        if (!s) { this.amountStr = '0.'; return; }
        if (s.includes('.')) return;
        this.amountStr = s + '.';
        return;
      }
      let next = (s === '0' ? '' : s) + String(val);
      const [int = '', frac = ''] = next.split('.');
      if (frac && frac.length > 9) return;
      if (!frac && int.length > 1 && int.startsWith('0')) next = String(Number(int));
      if (next.length > 20) return;
      this.amountStr = next;
    },

    backspace() {
      const s = String(this.amountStr ?? '');
      if (!s) return;
      this.amountStr = s.slice(0, -1) || '0';
    },

    openTonWallet() {
      tonConnectUI.openModal();
      try { TelegramModule.useMediumHaptic(); } catch {}
    },

    checkTonWallet() {
      this.walletConnected = !!tonConnectUI.connected;
      if (this.walletConnected && !this.walletAddress) this.getTonWalletAddress();
    },

    getTonWalletAddress() {
      if (!tonConnectUI.account) return;
      this.walletAddress = toUserFriendlyAddress(tonConnectUI.account.address);
    },

    async withdraw() {
      if (!this.amountNum || this.amountNum < 0.05 || this.loadingButton) return;
      this.loadingButton = true;

      const [i = '0', f = ''] = String(this.amountStr).split('.');
      const frac = (f + '000000000').slice(0, 9);
      const nano = (BigInt(i) * 1_000_000_000n) + BigInt(frac);

      try {
        const response = await MarketBalanceApi.withdraw(this.amountStr, Number(nano));
        if (!response) {
          showToast(t('wallet.withdrawModal.orderFailed'), 'error');
          return;
        }
        this.storeCache.UserData.user.Balance.balance_ton = response.new_balance_ton;
        showToast(t('wallet.withdrawModal.orderSuccess'), 'success');
        this.$emit('withdraw', {
          amount: this.amountNum,
          new_balance: response.new_balance_ton,
        });
        this.closeModal();
      } catch (e) {
        showToast(t('wallet.withdrawModal.orderFailed'), 'error');
        console.error(e);
      } finally {
        this.loadingButton = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./WalletModal.sass"
</style>
