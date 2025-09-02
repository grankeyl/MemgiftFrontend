<template>
  <div 
    class="_direction _comp _item _profileDisconnectModal"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalActive }"
      >
        <div @click="closeModal" class="_profileGiftModalClose"></div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
        :class="{ hide: !ModalActive }"
      >
        <div @click="closeModal" class="_profileGiftModalClose">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div class="_profileGiftModalTitle">
          <h4>{{ $t('profile.profileDisconnectModalTitle') }}</h4>
        </div>
        <div class="_profileGiftModalDescr">
          <p>{{ $t('profile.profileDisconnectModalDescr') }}</p>
        </div>
        <div class="_profileGiftModalButtons">
          <div class="_profileGiftModalButtonsCollectable">
            <button @click="() => walletDisconnect()">
              <h4>{{ $t('profile.profileDisconnectModalButton') }}</h4>
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { toUserFriendlyAddress } from 'ton-ui-vue';

import * as walletApi from '../../api/walletApi';

import TelegramModule from '../../hooks/useTelegram';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';
import { showToast } from '../../utils/toastManager';

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
    ModalActive: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  setup() {
    const walletConnected = ref(false);
    const walletAddress = ref('');

    const openTonWallet = () => {
      tonConnectUI.openModal();
      TelegramModule.useMediumHaptic();

      const interval = setInterval(() => {
        if (tonConnectUI.connected) {
          walletConnected.value = true;
          clearInterval(interval);
          
          const walletAddress = getTonWalletAddress();
          walletApi.connect({ address: walletAddress });
        }
      }, 1000);
    }

    const checkTonWallet = () => {
      const isTonWallet = tonConnectUI.connected;
      walletConnected.value = isTonWallet;
    }

    const getTonWalletAddress = () => {
      if (!tonConnectUI.account) return;
      const rawAddress = tonConnectUI.account.address;
      const walletAddressString = toUserFriendlyAddress(rawAddress);
      walletAddress.value = walletAddressString;
      return walletAddressString;
    }

    const disconnectTonWallet = async () => {
      walletConnected.value = false;
      showToast('Wallet disconnected', 'success');
      tonConnectUI.disconnect();
      await walletApi.disconnect();
    }

    getTonWalletAddress();
    checkTonWallet();
    
    return {
      tonConnectUI,
      openTonWallet,
      walletConnected,
      disconnectTonWallet,

      walletAddress,
    };
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,
      isLoadingModalImage: true,

      OwnerImage: true,
      ActiveButton: false,
      
      Icon,

      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    }
  },
  
  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const staticImages = [
        Image_Stars
      ].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...staticImages]);
    },

    closeModal() {
      this.$emit('closeModal');
    },

    walletDisconnect() {
      this.disconnectTonWallet();
      this.closeModal();
      TelegramModule.useMediumHaptic();
    },
  },
};
</script>

<style>
</style>