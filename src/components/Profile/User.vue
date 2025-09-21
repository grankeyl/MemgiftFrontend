<template>
  <div class="_direction _comp _item _user" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_image"></div>
          <div class="_name"></div>
          <div class="_descr"></div>
      </div>
      <div v-else class="_content">
          <div class="_profileTickets">
            <img :src="Image_Ticket" alt="button" />
            <p>{{ storeCache.UserData.user.Tickets || 0 }}</p>
          </div>
          <div class="_profileLanguage" @click="openLanguageModal">
            <img :src="`/profile/flags/${this.storeCache.UserData.user.Language}.png`" alt="language" />
            <p v-if="LanguageSelect">{{ getLanguageSelect }}</p>
            <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
            <div class="dropdown" :class="{ open: LanguageModalActive }" @click.stop>
              <div
                v-for="lang in LanguageList"
                class="item"
                @click.stop="selectLanguage(lang.id)"
              >
                <img :src="`/profile/flags/${lang.id}.png`" alt="language" />
                <p>{{ lang.title }}</p>
              </div>
            </div>
          </div>
          <div class="balance" @click="openWallet">
            <div class="context">
              <h4>{{ cutNumber(getBalance.toString()) }}</h4>
              <img src="/market/ton.svg" alt="ton" />
            </div>
            <div class="button">
              <img src="/market/plus.svg" alt="plus" />
            </div>
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
            <div class="_image_mark" @click="copyUserId()">
              <span>{{ storeCache.UserData.user.Tld }}</span>
              <Icon class="kit-icon" v-html="Icon.Copy"></Icon>
            </div>
          </div>
          <div class="_name">
            <h4 v-if="UserName">{{ UserName }}</h4>
            <h4 v-else>No Name</h4>
          </div>
          <div class="_descr">
            <p>
              {{ UserNftsCount }} 
              {{ pluralizeGift(
                  $t('app.sendGiftText'),
                  UserNftsCount, 
                  storeCache.TelegramData.user.language
                ) 
              }}
            </p>
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
      @click="openReferrals"
      :Skeleton="isLoading"
      :SkeletonTime="configApp.skeletonTime"
      :FuncsComp="[{ 
        Icon: Icon.Reward,
        Text: $t('profile.profileReferralProgram'), 
        TextMark: $t('app.newMark'), 
        New: true,
        Soon: false,
        First: true
      }]"
    />

    <Funcs
      :Skeleton="isLoading"
      :SkeletonTime="configApp.skeletonTime"
      :FuncsComp="[{ 
        Icon: Icon.Shield,
        Text: $t('profile.profileCreatePrivateDeal'), 
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
        Icon: Icon.Friends,
        Text: $t('profile.profileCreateMulticheck'),
        TextMark: $t('app.newMark'), 
        New: false,
        Soon: true,
        Last: true
      }]"
    />
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
import Funcs from './Funcs.vue';

import Image_Avatar from '@/assets/images/avatar.png';
import Image_Ticket from '@/assets/images/ticket.svg';
import i18next from 'i18next';

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
      isLoading: false,

      LanguageSelect: 'en',
      LanguageList: [
        { id: 'en', title: 'English' },
        { id: 'ru', title: 'Русский' },
      ],
      LanguageModalActive: false,

      UserAvatarLoading: true,
      UserAvatar: true,

      Icon,
      Image_Ticket,

      obfuscateAddress,
      pluralizeGift,
      cutNumber,
    };
  },

  mounted() {
    this.getTickets();

    this.LanguageSelect = this.storeCache.UserData.user.Language;

    this.$watch(() => this.storeCache.TelegramData, () => {
      this.getTickets();
    });
  },

  computed: {
    getLanguageSelect() {
      if (!this.storeCache.UserData.user.Language) return '';
      const lang = this.LanguageList.find(lang => lang.id === this.storeCache.UserData.user.Language);
      return lang?.title;
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },
  
  methods: {
    async openLanguageModal() {
      this.LanguageModalActive = this.LanguageModalActive ? false : true;
    },

    async selectLanguage(lang) {
      this.LanguageModalActive = false;
      const set = await settingsApi.set(lang);
      if (set.ok) { 
        this.storeCache.UserData.user.Language = lang;
        i18next.changeLanguage(lang);
      }
    },

    async getTickets() {
      try {
        this.storeCache.UserData.user.Tickets = this.storeCache.UserData.user.Tickets || 0;
      } catch {}
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

    openReferrals() {
      this.$router.push({ name: 'referral' });
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
    },

    copyUserId() {
      copyToClipboard(this.storeCache.UserData.user.Tld);
      showToast('User ID copied', 'success');
    },

    openWallet() {
      this.$router.push('/wallet');
    },
  },
};
</script>