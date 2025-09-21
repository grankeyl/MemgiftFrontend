<template>
    <div v-if="ModalActive" class="balance">
      <div class="context">
        <h4>{{ cutNumber(getBalance) }}</h4>
        <img src="/market/ton.svg" alt="ton" />
      </div>
      <div class="button">
        <img src="/market/plus.svg" alt="plus" />
      </div>
    </div>

  <div 
    class="_direction _comp _item _depositModal"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalActive }"
      >
        <div @click="closeModal" class="close"></div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
        :class="{ hide: !ModalActive }"
      >
        <div class="head">
          <div class="centered">
            <img src="/market/ton-white.svg" alt="ton-logo" />
            <h3>{{ $t('wallet.depositModal.title') }}</h3>
          </div>
          <div @click="closeModal" class="close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>
        <div v-if="walletConnected" class="connected">
          <img src="/market/wallet.svg" alt="wallet" />
          <p>{{ obfuscateAddress(walletAddress) }}</p>
          <span @click="disconnectTonWallet">
            <Icon class="kit-icon" v-html="Icon.Close"></Icon>
          </span>
        </div>
        <div class="input-amount">
          <input
            type="text"
            inputmode="none"
            autocomplete="off"
            placeholder="Your amount"
            :value="amountStr + ' TON'"
            readonly
            @focus="$event.target.blur()" />
          <img src="/market/ton.svg" alt="ton" />
        </div>
        <div class="num-pad">
          <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" @click="tap(n)">{{ n }}</button>
          <button @click="tap('.')">.</button>
          <button @click="tap(0)">0</button>
          <button class="back" @click="backspace">
            <img src="/market/delete-am.svg" alt="delete" />
          </button>
        </div>
        <div class="buttons">
          <button v-if="amountNum > 0" @click="deposit">
            <img src="/market/deposit.svg" alt="deposit" />
            <h4>{{ $t('wallet.deposit') }} {{ cutNumber(amountNum) }}</h4>
            <img src="/market/ton-white.svg" alt="ton" />
          </button>
          <button v-else disabled>
            <img src="/market/deposit.svg" alt="deposit" />
            <h4>{{ $t('wallet.deposit') }}</h4>
          </button>
        </div>
      </div>
  </div>
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

import * as MarketBalanceApi from '../../api/market/balance';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
  },
  components: { Lottie },

  data() {
    return {
      storeCache: useCacheStore(),

      // ВАЖНО: объявляем, иначе не реактивно
      isLoading: true,

      isLoadingModalImage: true,
      localSelected: '',
      OwnerImage: true,
      ActiveButton: false,

      // Держим ввод СТРОКОЙ
      amountStr: '10',

      // Состояние кошелька
      walletConnected: false,
      walletAddress: '',

      Icon,
      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,
      cutNumber,
      obfuscateAddress,
    };
  },

  computed: {
    isSkeleton() { return this.Skeleton; },
    amountNum() {
      const n = parseFloat(this.amountStr.replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
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
        await Promise.all([document.fonts.ready, this.loadImages()]);
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch (e) {
        console.error('Ошибка при загрузке ресурсов:', e);
      }
    },
    loadImages() {
      const staticImages = [Image_Stars].map((src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
      }));
      return Promise.all(staticImages);
    },

    // ====== Клавиатура ======
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
      if (frac && frac.length > 9) return; // максимум 9 знаков после точки

      if (!frac && int.length > 1 && int.startsWith('0')) {
        next = String(Number(int));
      }
      if (next.length > 20) return;

      this.amountStr = next;
    },
    backspace() {
      const s = String(this.amountStr ?? '');
      if (!s) return;
      this.amountStr = s.slice(0, -1) || '0';
    },

    // ====== TON Wallet ======
    openTonWallet() {
      tonConnectUI.openModal();
      // Если есть TelegramModule — можно дернуть haptic:
      // TelegramModule?.useMediumHaptic?.();
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
      return friendly;
    },
    disconnectTonWallet() {
      this.walletConnected = false;
      tonConnectUI.disconnect();
      this.$emit('closeModal');
    },

    // ====== Депозит ======
    async deposit() {
      if (!this.amountNum || this.amountNum < 0.1) return;
      const [i = '0', f = ''] = String(this.amountStr).split('.');
      const frac = (f + '000000000').slice(0, 9);
      const nano = (BigInt(i) * 1_000_000_000n) + BigInt(frac);

      try {
        const response = await MarketBalanceApi.deposit(Number(nano));
        if (!response) return;
        await this.sendPayment(response.address, response.memo);
        this.$emit('deposit', parseFloat(this.amountStr));
        showToast(t('wallet.depositModal.orderSuccess'), 'success');
      } catch (e) {
        showToast(t('wallet.depositModal.orderFailed'), 'error');
        console.error(e);
      }
    },

    async sendPayment(receiverAddress, memo) {
      const body = beginCell()
        .storeUint(0, 32)
        .storeStringTail(String(memo ?? ""))
        .endCell();

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: Address.parse(receiverAddress).toString(),
            amount: toNano(this.amountNum).toString(),
            payload: body.toBoc().toString('base64'),
          },
        ],
      };
      await tonConnectUI.sendTransaction(tx);
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./DepositModal.sass"
</style>