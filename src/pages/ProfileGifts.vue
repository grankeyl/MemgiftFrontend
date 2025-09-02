<template>
  <div
    @click="ModalComp.ModalActive = false"
    class="overlay"
    :class="{ hide: !ModalComp.ModalActive }"
  ></div>

  <div
    @click="ModalComp.ModalTransferActive = false"
    class="overlay"
    :class="{ hide: !ModalComp.ModalTransferActive }"
  ></div>

  <div
    @click="ModalDisconnectWalletComp.ModalActive = false"
    class="overlay"
    :class="{ hide: !ModalDisconnectWalletComp.ModalActive }"
  ></div>

  <div 
    class="_wrap _profile flex-grow-scroll" 
    :class="{ desktop: isDesktop() }"
  >
    <div class="_view">
      <Title
        @loadSuccess="handleLoadSuccess"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :Text="storeCache.NftsAppData[nftUniqueKeyParam]?.Name"
        Key="_default"
        :ImageShow="false"
      />

      <Gifts
        @loadSuccess="handleLoadSuccess"
        @useModal="useModal"
        @useTab="setActiveTab"
        @transferAllToReceived="transferAllToReceived"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :NftUniqueKey="nftUniqueKeyParam"
        :CategoriesList="CategoriesList"
        :ActiveTab="ActiveTab"
        :GiftsReceivedList="GiftsComp.ReceivedList"
        :GiftsPurchasedList="GiftsComp.PurchasedList"
      />

      <Modal
        @loadSuccess="handleLoadSuccess"
        @closeModal="closeModal"
        @transferNft="transferNft"
        @sendedNft="sendedNft"
        @useTransferModal="useTransferModal"
        @useTransfered="useTransfered"
        @closeTransferModal="closeTransferModal"
        @upgradedNftModal="upgradedNftModal"
        @removeGift="removeGift"
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :ModalActive="ModalComp.ModalActive"
        :ModalTransferActive="ModalComp.ModalTransferActive"
        :ModalComp="ModalComp"
        :UpgradedNft="UpgradedNft"
        :Table="GiftTableList"
      />
      
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { getConfig } from '../config';
import { useSelector } from '../helpers/helpers';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { checkLoaded } from '../utils/checkLoaded';
import { splitCamelCase, unixToDefault } from '../utils/useApp';
import { clearBackgroundName, getUpgradedModel, getUpgradedSymbol } from '../utils/useGift';
import { useRoute } from 'vue-router';

import * as nftApi from '../api/nftApi';

import Title from '../components/Root/Title.vue';
import Modal from '../components/Profile/Modal.vue';
import Gifts from '../components/ProfileGifts/Gifts.vue';

import i18next from 'i18next';
import TelegramModule from '../hooks/useTelegram';

const { t } = i18next;

export default defineComponent({
  components: {
    Title,
    Gifts,
    Modal,
  },

  setup() {
    const pageApp = ref('Profile');
    const configApp = ref(getConfig());
    const storeCache = useCacheStore() as any;
    const userApp = useSelector((state) => state.auth.user);

    TelegramModule.hideBackButton();

    const handleLoads = ref(0);
    const isPageLoading = ref(true);
    
    const route = useRoute();
    const nftUniqueKeyParam = ref(route.params.nft as any);

    const UserComp = ref({
      Image: null as string | null,
      Name: "Loading.." as string | null,
      NFTs: 0 as number | null,
    });

    const GiftsComp = ref({
      Loading: true,
      ReceivedList: [] as any[],
      PurchasedList: [] as any[],
    });

    const ModalComp = ref({
      ModalActive: false,
      ModalTransferActive: false,
      NftUniqueKey: '',
      NftImage: '',
      NftName: '',
      NftId: '',
      NftKey: '',
      NftUuid: '',
      NftPrice: 0,
      NftRarity: '',
      NftStatus: '',
      NftMedia: '',
      NftUpgradeSupport: false,
      NftUpgradePrice: 0,
      NftUpgraded: false,
    });

    const UpgradedNft = ref({
        ModelName: null,
        ModelImage: null,
        ModelDropRate: null,
        BackgroundName: null,
        BackgroundColors: null,
        BackgroundDropRate: null,
        SymbolName: null,
        SymbolImage: null,
        SymbolDropRate: null,
        ModelNumber: null,
    }) as any;

    const ModalDisconnectWalletComp = ref({
      ModalActive: false,
    });

    const CategoriesList = ref([
      { id: 1, Title: t('profile.profileGiftsCategory1'), Key: 'received' },
      { id: 2, Title: t('profile.profileGiftsCategory2'), Key: 'purchased' },
    ]);

    const GiftTableList = ref({
      OwnerAvatar: '',
      OwnerAvatarLoading: false,
      OwnerName: '',
      NftDate: '',
      NftPrice: '',
      NftSupply: `300 ${t('app.supplySubmission')} 1000`,
      NftOldOwner: {
        user_full_name: 0,
        user_photo: 0,
      },
    });

    const GiftReceivedOffset = ref(0);
    const GiftReceivedLimit = ref(10);

    const GiftPurchasedOffset = ref(0);
    const GiftPurchasedLimit = ref(10);

    const ActiveTab = ref('received');

    const isLoadingMoreReceived = ref(false);
    const isLoadingMorePurchased = ref(false);

    const pageEmit = () => {
      checkLoaded((event: string) => (event as any));
    };

    const handleLoadSuccess = () => {
      handleLoads.value++;

      if (handleLoads.value >= 2) {
        setTimeout(() => {
          isPageLoading.value = false;
          storeCache.LoadedData.push(pageApp.value);
        }, 200);
      }
    };

    const UserCompInit = async () => {
      if (!storeCache.TelegramData?.user) {
        console.error('TelegramData or user is not defined in storeCache');
        return;
      }

      const Image = storeCache.UserData.Photo;
      const FullName = storeCache.UserData.Name;

      UserComp.value.Image = Image;
      UserComp.value.Name = FullName;

      await loadMoreGifts();
    };

    const UpgradedNftClear = () => {
      UpgradedNft.value.ModelName = null;
      UpgradedNft.value.ModelImage = null;
      UpgradedNft.value.ModelDropRate = null;
      UpgradedNft.value.BackgroundName = null;
      UpgradedNft.value.BackgroundColors = null;
      UpgradedNft.value.BackgroundDropRate = null;
      UpgradedNft.value.SymbolName = null;
      UpgradedNft.value.SymbolImage = null;
      UpgradedNft.value.SymbolDropRate = null;
      UpgradedNft.value.ModelNumber = null;
    };

    const ModalCompInit = async (arg: any, type: any) => {
      if (!arg) return;

      let nft = null;

      if (type === 'purchased') {
        nft = GiftsComp.value.PurchasedList.find(gift => gift.uuid === arg);
      }
      if (type === 'received') {
        nft = GiftsComp.value.ReceivedList.find(gift => gift.uuid === arg);
      }

      if (!nft) return;

      const NftData = storeCache.NftsAppData[nft.nft_unique_key];
      if (!NftData) return;

      ModalComp.value.NftId = nft.uuid;
      ModalComp.value.NftStatus = nft.status;
      ModalComp.value.NftKey = NftData.Key;
      ModalComp.value.NftUuid = arg;
      ModalComp.value.NftUniqueKey = NftData.UKey;
      ModalComp.value.NftMedia = NftData.Media;
      ModalComp.value.NftUpgraded = nft.upgraded;
      ModalComp.value.NftUpgradeSupport = NftData.UpgradeSupport;

      GiftTableList.value.OwnerName = storeCache.TelegramData.user.firstName;
      GiftTableList.value.OwnerAvatar = storeCache.TelegramData.user.photoUrl;
      GiftTableList.value.NftDate = unixToDefault(nft.timestamp);
      GiftTableList.value.NftPrice = nft.nft_price;
      GiftTableList.value.NftSupply = `${Math.max(NftData.Supply - NftData.SupplyUsers, 0)} of ${NftData.Supply}`;

      if (nft.nft_old_owner) {
        GiftTableList.value.NftOldOwner = {
          user_full_name: nft.nft_old_owner.user_full_name,
          user_photo: nft.nft_old_owner.user_photo,
        };
      }

      if (nft.upgraded) {
        const backgroundCleared = clearBackgroundName(nft.model_background);
        
        UpgradedNft.value.ModelImage = getUpgradedModel(nft.nft_unique_key, nft.model_name, ModalComp.value.NftMedia);
        UpgradedNft.value.SymbolImage = getUpgradedSymbol(nft.model_symbol);
        ModalComp.value.NftName = nft.model_name;
        UpgradedNft.value.ModelName = nft.model_name;
        UpgradedNft.value.SymbolName = nft.model_symbol;
        UpgradedNft.value.BackgroundName = backgroundCleared;

        upgradeNftInfo(
          ModalComp.value.NftUniqueKey,
          UpgradedNft.value.ModelName, 
          UpgradedNft.value.SymbolName
        );

        UpgradedNft.value.BackgroundColors = storeCache.Upgrades.Backgrounds[backgroundCleared];
        
        if (!UpgradedNft.value.BackgroundColors) {
          UpgradedNft.value.BackgroundColors = {};
        }

        UpgradedNft.value.BackgroundColors.Center = storeCache?.Upgrades?.Backgrounds[backgroundCleared]?.BackgroundColors?.Center;
        UpgradedNft.value.BackgroundColors.Around = storeCache?.Upgrades?.Backgrounds[backgroundCleared]?.BackgroundColors?.Around;

        if (!UpgradedNft.value.BackgroundDropRate) {
          UpgradedNft.value.BackgroundDropRate = 1.2;
        }

        UpgradedNft.value.BackgroundDropRate = storeCache?.Upgrades?.Backgrounds[backgroundCleared]?.DropRate;
        UpgradedNft.value.ModelNumber = nft.model_number;
        return true;
      }

      ModalComp.value.NftImage = NftData.ImageMain;
      ModalComp.value.NftName = NftData.Name;
      ModalComp.value.NftRarity = NftData.Rarity;
      ModalComp.value.NftUpgradePrice = NftData.UpgradePrice;
      UpgradedNftClear();

      return true;
    };

    const useModal = async ({ id, type }: { id: any, type: any }) => {
      const init = await ModalCompInit(id, type);
      console.log(init);
      if (!init) return;
      ModalComp.value.ModalActive = true;
    };

    const useTransfered = async () => {
      await nullableGiftsGet();
    };

    const upgradeNftInfo = async (
      nftUniqueKey: string,
      modelName: string, 
      modelSymbol: string
    ) => {
      const upgradeNft = await nftApi.getNftUpgradeInfo(
        nftUniqueKey,
        modelName,
        modelSymbol
      );
      if (!upgradeNft) {
        UpgradedNft.value.ModelDropRate = 1.2;
        UpgradedNft.value.SymbolDropRate = 1.4;
      };
      
      UpgradedNft.value.ModelDropRate = upgradeNft.ModelDropRate;
      UpgradedNft.value.SymbolDropRate = upgradeNft.SymbolDropRate;
    };

    const closeModal = () => {
      ModalComp.value.ModalActive = false;
    };

    const useTransferModal = () => {
      ModalComp.value.ModalTransferActive = true;
    };

    const closeTransferModal = () => {
      ModalComp.value.ModalTransferActive = false;
    };

    const upgradedNftModal = (
      id: number,
      model_name: string,
      model_symbol: string,
      model_background: string,
      model_number: number,
    ) => {
      for (const stack of GiftsComp.value.ReceivedList) {
        const gift = stack.stackGifts.find((g: any) => g.id === id);
        if (gift) {
          gift.upgraded = true;
          gift.model_name = model_name;
          gift.model_symbol = model_symbol;
          gift.model_background = model_background;
          gift.model_number = model_number;
          break;
        }
      }
    };

    const setActiveTab = (arg: string) => {
      ActiveTab.value = arg;
    };

    const transferNft = async () => {
      await nullableGiftsGet();
    };

    const sendedNft = (id: string) => {
      const giftToUpdate = GiftsComp.value.PurchasedList.find(gift => gift.id === id);
      if (!giftToUpdate) return;

      giftToUpdate.status = 'sended';
    };

    const removeGift = (id: string) => {
      for (const stack of GiftsComp.value.ReceivedList) {
        const index = stack.stackGifts.findIndex((g: any) => g.id === id);
        if (index !== -1) {
          stack.stackGifts.splice(index, 1);
          break;
        }
      }
    };

    const openDisconnectModal = () => {
      console.log('openDisconnectModal');
      ModalDisconnectWalletComp.value.ModalActive = true;
    };

    const closeDisconnectModal = () => {
      ModalDisconnectWalletComp.value.ModalActive = false;
    };

    const loadMoreGiftsReceived = async () => {
      if (isLoadingMoreReceived.value) return;
      isLoadingMoreReceived.value = true;

      const nftUniqueKey = route.params.nft as string;

      if (GiftReceivedLimit.value >= 0) {
        const newGiftsReceived = await nftApi.getAllReceived(
          storeCache.TelegramData.user.id,
          GiftReceivedOffset.value,
          GiftReceivedLimit.value,
          nftUniqueKey
        );

        if (newGiftsReceived.length === 0) {
          isLoadingMoreReceived.value = true;
          return;
        }

        GiftsComp.value.ReceivedList.push(...newGiftsReceived);
        GiftReceivedOffset.value += GiftReceivedLimit.value;
      }

      isLoadingMoreReceived.value = false;
    };

    const loadMoreGifts = async () => {
      if (isLoadingMoreReceived.value && isLoadingMorePurchased.value) return;
      isLoadingMoreReceived.value = true;
      isLoadingMorePurchased.value = true;

      if (GiftReceivedLimit.value >= 0 && GiftPurchasedLimit.value >= 0) {
        const stacks = await nftApi.getAllStacksUKey(nftUniqueKeyParam.value, GiftReceivedOffset.value, GiftReceivedLimit.value);
        if (!stacks) return;

        const receivedStacks = stacks.stacks.filter((stack: any) => stack.stackStatus === 'received');
        const purchasedStacks = stacks.stacks.filter((stack: any) => stack.stackStatus === 'purchased');

        if (receivedStacks.length === 0) {
          isLoadingMoreReceived.value = true;
        } else {
          GiftsComp.value.ReceivedList.push(...receivedStacks[0].stackGifts);
          GiftReceivedOffset.value += GiftReceivedLimit.value;
        }

        if (purchasedStacks.length === 0) {
          isLoadingMorePurchased.value = true;
        } else {
          GiftsComp.value.PurchasedList.push(...purchasedStacks[0].stackGifts);
          GiftPurchasedOffset.value += GiftPurchasedLimit.value;
        }
      }

      isLoadingMoreReceived.value = false;
      isLoadingMorePurchased.value = false;
    };

    const setupInfiniteScroll = () => {
      const scrollElement = document.querySelector('.flex-grow-scroll');
      if (!scrollElement) return;

      scrollElement.addEventListener('scroll', async () => {
        if (scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 230) {
          if (ActiveTab.value === 'received') await loadMoreGifts();
          if (ActiveTab.value === 'purchased') await loadMoreGifts();
        }
      });
    };

    const transferAllToReceived = async () => {
      ActiveTab.value = 'received';
      await nullableGiftsGet();
    };

    const nullableGiftsGet = async () => {
      GiftsComp.value.ReceivedList = [];
      GiftsComp.value.PurchasedList = [];
      isLoadingMoreReceived.value = false;
      isLoadingMorePurchased.value = false;
      GiftReceivedLimit.value = 10;
      GiftPurchasedLimit.value = 10;
      GiftReceivedOffset.value = 0;
      GiftPurchasedOffset.value = 0;
      await loadMoreGifts();
    };

    onMounted(() => {
      pageEmit();

      if (storeCache.TelegramData?.user) {
        UserCompInit();
        setupInfiniteScroll();
      }
    });

    watch(
      () => storeCache.TelegramData,
      (newValue) => {
        if (newValue?.user) {
          UserCompInit();
          setupInfiniteScroll();
        }
      },
      { immediate: true }
    );

    return {
      configApp,
      storeCache,
      userApp,
      handleLoads,
      isPageLoading,
      UserComp,
      GiftsComp,
      ModalComp,
      CategoriesList,
      GiftTableList,
      GiftPurchasedOffset,
      GiftPurchasedLimit,
      isLoadingMoreReceived,
      isLoadingMorePurchased,
      isDesktop,
      handleLoadSuccess,
      ActiveTab,
      setActiveTab,
      transferNft,
      sendedNft,
      UserCompInit,
      ModalCompInit,
      useModal,
      closeModal,
      loadMoreGiftsReceived,
      loadMoreGifts,
      useTransferModal,
      closeTransferModal,
      upgradedNftModal,
      removeGift,
      UpgradedNft,
      transferAllToReceived,
      useTransfered,

      ModalDisconnectWalletComp,
      openDisconnectModal,
      closeDisconnectModal,

      nftUniqueKeyParam,
      splitCamelCase,
    };
  }
});
</script>

<style lang="sass">
@use "@/assets/styles/profile/_main.sass"
@use "@/assets/styles/profile/_comp.sass"
</style>