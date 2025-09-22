<template>
  <div class="_direction _comp _item blocker">
    <div v-if="isLoading" class="_skeleton">
      <div class="items">
        <div class="item"></div>
        <div class="item"></div>
      </div>
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="block">
        <div v-if="walletConnected" class="wallet">
          <img :src="WalletImg" alt="wallet" />
          <p>{{ obfuscateAddress(walletAddress) }}</p>
          <span @click="disconnectTonWallet">
            <Icon class="kit-icon" v-html="Icon.Close"></Icon>
          </span>
        </div>
        <div v-if="!walletConnected" class="wallet">
          <img :src="WalletImg" alt="wallet" />
          <p>{{ $t('wallet.walletNotConnected') }}</p>
          <button @click="openTonWallet">
            <p>{{ $t('wallet.connect') }}</p>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.3813 2.49976H3.81748C2.42677 2.49976 1.5453 3.99988 2.24497 5.21261L6.91307 13.3035C7.21769 13.8318 7.98109 13.8318 8.28571 13.3035L12.9548 5.21261C13.6535 4.00182 12.772 2.49976 11.3822 2.49976H11.3813ZM6.90927 10.8772L5.89264 8.90967L3.4396 4.52249C3.27778 4.24169 3.47765 3.88185 3.81653 3.88185H6.90832V10.8781L6.90927 10.8772ZM11.7573 4.52154L9.30519 8.91062L8.28856 10.8772V3.8809H11.3803C11.7192 3.8809 11.9191 4.24074 11.7573 4.52154Z" fill="#2864FF"/>
            </svg>
          </button>
        </div>
        <div class="bal">
          <h1>{{ cutNumber(getBalance) }}</h1>
          <img :src="TonImg" alt="ton" />
        </div>
        <div class="buttons" :class="{ disabled: !walletConnected }">
          <button @click="openWithdraw">
            <img :src="WithdrawImg" alt="withdraw" />
            <h4>{{ $t('wallet.withdraw') }}</h4>
          </button>
          <button @click="openDeposit">
            <img :src="DepositImg" alt="deposit" />
            <h4>{{ $t('wallet.deposit') }}</h4>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Icon } from '../Icon';
import { obfuscateAddress } from '@/utils/useApp';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { toUserFriendlyAddress } from 'ton-ui-vue';
import { showToast } from '../../utils/toastManager';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { cutNumber } from '../../utils/useTon';

import * as walletApi from '../../api/walletApi';

import Lottie from '../Lottie.vue';

// Images
import WalletImg from '@/assets/images/market/wallet.svg';
import TonImg from '@/assets/images/market/ton.svg';
import WithdrawImg from '@/assets/images/market/withdraw.svg';
import DepositImg from '@/assets/images/market/deposit.svg';
import TelegramModule from '../../hooks/useTelegram';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      WalletImg,
      TonImg,
      WithdrawImg,
      DepositImg,

      storeCache: useCacheStore(),
      isLoading: this.Skeleton,

      Icon,
      cutNumber,
    };
  },

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
          const walletAddress = getTonWalletAddress();
          const response = await walletApi.create(walletAddress);
          if (response && response.WalletAddress) {
            showToast('Wallet connected', 'success');
          } else {
            clearInterval(interval);
            showToast('Wallet not connected', 'error');
          }
        }
      }, 1000);
    }

    const checkTonWallet = () => {
      const isTonWallet = tonConnectUI.connected;
      walletConnected.value = isTonWallet;
    }

    const getTonWalletAddress = async () => {
      if (!tonConnectUI.account) return;
      const rawAddress = tonConnectUI.account.address;
      const walletAddressString = toUserFriendlyAddress(rawAddress);
      walletAddress.value = walletAddressString;
      if (tonConnectUI.connected) { await walletApi.create(walletAddress.value); }
      return walletAddressString;
    }

    const disconnectTonWallet = () => {
      walletConnected.value = false;
      tonConnectUI.disconnect();
    }

    getTonWalletAddress();
    checkTonWallet();

    setInterval(() => {
      checkTonWallet();
    }, 1000);
    
    return {
      tonConnectUI,
      openTonWallet,
      walletConnected,
      disconnectTonWallet,
      obfuscateAddress,

      walletAddress,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadIcons()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadIcons() {
      return new Promise((resolve, reject) => {
        const div = document.createElement("div");
        div.innerHTML = this.Icon;

        const icons = div.querySelectorAll("img, svg");
        const promises = Array.from(icons).map((icon) => {
          if (icon.tagName === "IMG") {
            return new Promise((resolveImage, rejectImage) => {
              const img = new Image();
              img.src = icon.src;
              img.onload = resolveImage;
              img.onerror = rejectImage;
            });
          } else if (icon.tagName === "SVG") {
            return new Promise((resolveSvg) => {
              const checkSvgLoaded = () => {
                if (icon.getBBox().width > 0) {
                  resolveSvg();
                } else {
                  requestAnimationFrame(checkSvgLoaded);
                }
              };
              checkSvgLoaded();
            });
          }
        });

        Promise.all(promises).then(resolve).catch(reject);
      });
    },

    openDeposit() {
      this.$emit('openDeposit');
    },

    openWithdraw() {
      this.$emit('openWithdraw');
    },
  },
};
</script>

<style lang="sass">
@use "./Blocker.sass"
</style>