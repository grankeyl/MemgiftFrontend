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
          <h3>{{ $t('wallet.depositModal.title') }}</h3>
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

        <div class="wmod-pad" role="group" aria-label="Keypad">
          <button type="button" v-for="n in [1,2,3,4,5,6,7,8,9]" :key="'d'+n" @click="tap(n)">{{ n }}</button>
          <button type="button" @click="tap('.')">.</button>
          <button type="button" @click="tap(0)">0</button>
          <button type="button" class="wmod-pad__back" @click="backspace" aria-label="Backspace">
            <img :src="DeleteAmImg" alt="" />
          </button>
        </div>

        <button
          type="button"
          class="wmod-submit"
          :disabled="amountNum < 0.1 || submitting"
          @click="deposit"
        >
          <span v-if="amountNum > 0">{{ $t('wallet.deposit') }} {{ cutNumber(amountNum) }} TON</span>
          <span v-else>{{ $t('wallet.deposit') }}</span>
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
import { beginCell, toNano, Address } from '@ton/core';
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
      amountStr: '10',
      submitting: false,
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

    async deposit() {
      if (!this.amountNum || this.amountNum < 0.1 || this.submitting) return;
      this.submitting = true;
      const [i = '0', f = ''] = String(this.amountStr).split('.');
      const frac = (f + '000000000').slice(0, 9);
      const nano = (BigInt(i) * 1_000_000_000n) + BigInt(frac);

      try {
        const response = await MarketBalanceApi.deposit(Number(nano));
        if (!response) {
          showToast(t('wallet.depositModal.orderFailed'), 'error');
          return;
        }
        await this.sendPayment(response.address, response.memo);
        this.$emit('deposit', parseFloat(this.amountStr));
        showToast(t('wallet.depositModal.orderSuccess'), 'success');
        this.closeModal();
      } catch (e) {
        showToast(t('wallet.depositModal.orderFailed'), 'error');
        console.error(e);
      } finally {
        this.submitting = false;
      }
    },

    async sendPayment(receiverAddress, memo) {
      const body = beginCell()
        .storeUint(0, 32)
        .storeStringTail(String(memo ?? ''))
        .endCell();

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [{
          address: Address.parse(receiverAddress).toString(),
          amount: toNano(this.amountNum).toString(),
          payload: body.toBoc().toString('base64'),
        }],
      });
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./WalletModal.sass"
</style>
