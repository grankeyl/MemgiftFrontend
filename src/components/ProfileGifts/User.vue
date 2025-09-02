<template>
  <div class="_direction _comp _item _user" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_profileTickets"></div>
          <div class="_image"></div>
          <div class="_name"></div>
          <div class="_descr"></div>
      </div>
      <div v-else class="_content">
          <div class="_profileTickets">
            <img :src="Image_Ticket" alt="button" />
            <p>{{ storeCache.UserData.Tickets || 0 }}</p>
          </div>
          <div class="_image">
            <div
              v-if="UserImage && UserAvatar"
              class="_image_img" 
              :class="{ _loading: UserAvatarLoading }"
            >
              <img 
                @load="UserAvatarLoading = false"
                @error="UserAvatar = false"
                :src="UserImage"
                alt="avatar"
              />
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </div>
            <div v-else class="_image_img">
              <div class="_image_avatar_null">
                <h4 v-if="UserName">{{ UserName[0] }}</h4>
                <h4 v-else>No Name</h4>
              </div>
            </div>
            <div class="_image_mark">
              <span>#{{ UserRank }}</span>
            </div>
          </div>
          <div class="_name">
            <h4 v-if="UserName">{{ UserName }}</h4>
            <h4 v-else>No Name</h4>
          </div>
          <div class="_descr">
            <p>{{ UserNftsCount }} {{ $t('app.giftsSubmission') }}</p>
          </div>

          <div class="_connectWallet">
            <div v-if="!walletConnected" @click="() => openTonWallet()" class="_connectWalletContent">
              <img src="/profile/ton-lig.svg" alt="tonconnect" />
              <h4>{{ $t('profile.profileConnect') }}</h4>
            </div>
            <div v-if="walletConnected" @click="() => openDisconnectModal()" class="_connectWalletContent">
              <img src="/profile/ton-lig.svg" alt="tonconnect" />
              <h4>{{ obfuscateAddress(walletAddress) }}</h4>
            </div>
          </div>

      </div>
  </div>

  <!-- <div class="_direction _comp _item _defer">
    <div v-if="isLoading" class="_content">
      <div class="_wallet"></div>
    </div>

    <div v-if="!isLoading" class="_content">
      <div class="_wallet">
        <div class="_walletLeft">
          <img src="/profile/ton.svg" alt="tonconnect" />
          <span>0.0</span>
        </div>
        <div class="_walletRight">
          <span @click="withdraw" class="_walletRightWithdraw">
            <img src="/profile/withdraw.svg" alt="withdraw" />
          </span>
          <span @click="deposit" class="_walletRightDeposit">
            <img src="/profile/deposit.svg" alt="deposit" />
          </span>
        </div>
      </div>
    </div>
  </div> -->

  <div class="_direction _comp _item _funcers">
    <Funcs
      :Skeleton="isLoading"
      :SkeletonTime="configApp.skeletonTime"
      :FuncsComp="[{ 
        Text: $t('profile.profileReferralProgram'), 
        TextMark: $t('app.newMark'), 
        New: false,
        Soon: true,
        First: true
      }]"
    />

    <Funcs
      :Skeleton="isLoading"
      :SkeletonTime="configApp.skeletonTime"
      :FuncsComp="[{ 
        Text: $t('profile.profileCreatePrivateDeal'), 
        TextMark: $t('app.newMark'), 
        New: false,
        Soon: true,
        First: true
      }]"
    />

    <Funcs
      @click="openMulticheck"

      :Skeleton="isLoading"
      :SkeletonTime="configApp.skeletonTime"
      :FuncsComp="[{
        Text: $t('profile.profileCreateMulticheck'),
        TextMark: $t('app.newMark'), 
        New: false,
        Soon: false,
        Last: true
      }]"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import { getConfig } from '../../config';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { useToast } from 'vue-toast-notification';
import { Icon } from '../Icon';
import { obfuscateAddress } from '@/utils/useApp';
import { toUserFriendlyAddress } from 'ton-ui-vue';

import * as walletApi from '../../api/walletApi';
import * as balanceApi from '../../api/balanceApi';

import TelegramModule from '../../hooks/useTelegram';
import Lottie from '../Lottie.vue';
import Funcs from './Funcs.vue';

import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';


export default {
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
          walletApi.create({ address: walletAddress });
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

    const disconnectTonWallet = () => {
      walletConnected.value = false;
      tonConnectUI.disconnect();
      // walletApi.disconnect();
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

      walletAddress,
    };
  },

  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    },
    UserImage: {
      type: String,
      required: true,
    },
    UserName: {
      type: String,
      required: true,
    },
    UserNftsCount: {
      type: Number,
      required: true,
    },
    UserRank: {
      type: Number,
      required: true,
    }
  },

  components: {
    Lottie,
    Funcs,
  },

  data() {
    return {
      configApp: getConfig(),
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,

      UserAvatarLoading: true,
      UserAvatar: true,

      Icon,
      Image_Ticket,

      obfuscateAddress,
    };
  },

  mounted() {
    this.loadResources();
    this.getTickets();

    this.$watch(() => this.storeCache.TelegramData, () => {
      this.getTickets();
    });
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
  },
  
  methods: {
    async getTickets() {
      try {
        this.storeCache.UserData.Tickets = this.storeCache.UserData.Tickets || 0;
      } catch {}
    },

    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        if (
          this.UserAvatar,
          this.$props.UserName,
          this.$props.UserNftsCount,
          this.$props.UserRank
        ) {
          this.isLoading = false;
          this.$emit("loadSuccess");
        }
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const staticImages = [
        Image_Avatar,
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

    openDisconnectModal() {
      this.$emit('openDisconnectModal');
    },

    openMulticheck() {
      this.$router.push({ name: 'multicheck' });
    },

    async withdraw() {
      try {
        if (!this.userFriendlyAddress) {
          this.$toast.error('Please connect your wallet first', {
            position: 'top-right',
          });
          return;
        }
        
      } catch (error) {
        showToast('Error depositing funds', 'error');
      }
    },

    async deposit() {
      try {
        if (!this.userFriendlyAddress) {
          this.$toast.error('Please connect your wallet first', { position: 'top-right' });
          return;
        }

        this.$router.push({ name: 'deposit' });

      } catch (error) {
        this.$toast.success('Error depositing funds', { position: 'top-right' });
      }
    }
  },
};
</script>