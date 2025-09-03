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
    @click="ModalModelComp.ModalActive = false"
    class="overlay darkned"
    :class="{ hide: !ModalModelComp.ModalActive }"
  ></div>

  <div
    @click="ModalSortComp.ModalActive = false"
    class="overlay darkned"
    :class="{ hide: !ModalSortComp.ModalActive }"
  ></div>

  <div 
    class="_wrap _profile flex-grow-scroll" 
    :class="{ desktop: isDesktop() }"
  >
    <div class="_view">
      <div class="stylish">
        <div class="starsed">
          <img src="/profile/stylish.svg" alt="stars" />
        </div>
      </div>

      <div class="fixed">
        <User
          @loadSuccess="handleLoadSuccess"
          @openDisconnectModal="openDisconnectModal"
          @closeDisconnectModal="closeDisconnectModal"
          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
          :UserImage="UserComp.Image"
          :UserName="UserComp.Name"
          :UserNftsCount="UserComp.NFTs"
          :UserId="UserComp.Tld"
        />

        <Gifts
          @loadMore="fetchNftsStacks"
          @loadSuccess="handleLoadSuccess"
          @useModal="useModal"
          @useTab="setActiveTab"
          @openModelModal="ModalModelComp.ModalActive = true"
          @openSortModal="ModalSortComp.ModalActive = true"
          @clearAll="clearAll"
          @clearModels="clearModels"
          @clearSort="clearSort"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
          :CategoriesList="CategoriesList"
          :GiftsList="GiftsComp.List"
          :GiftsCount="GiftsComp.NFTsCount"
          :GiftsLoading="GiftsComp.Loading"
          :ActiveTab="ActiveTab"
          :SelectedModels="ModalModelComp.ModelsSelected"
          :SelectedSort="ModalSortComp.SortSelected"
          :SortItems="ModalSortComp.SortItems"
          :Searching="GiftsComp.Searching"
        />
      </div>

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

        @UPGRADE="(val: any) => UpgradedNft = val"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :ModalActive="ModalComp.ModalActive"
        :ModalTransferActive="ModalComp.ModalTransferActive"
        :ModalComp="ModalComp"
        :UpgradedNft="UpgradedNft"
        :Table="GiftTableList"
      />

      <DisconnectModal
        @closeModal="ModalDisconnectWalletComp.ModalActive = false"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :ModalActive="ModalDisconnectWalletComp.ModalActive"
      />

      <ModelModal
        @closeModal="() => { ModalModelComp.ModalActive = false }"
        @apply="applyModels"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :ModalActive="ModalModelComp.ModalActive"
        :GiftsList="storeCache.NftsAppData"
        :Selected="ModalModelComp.ModelsSelected"
      />

      <SortModal
        @closeModal="() => { ModalSortComp.ModalActive = false }"
        @apply="applySort"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :ModalActive="ModalSortComp.ModalActive"
        :SortItems="ModalSortComp.SortItems"
        :Selected="ModalSortComp.SortSelected"
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
import { unixToDefault } from '../utils/useApp';
import { clearBackgroundName } from '../utils/useGift';
import { useRoute } from 'vue-router';

import * as nftApi from '../api/nftApi';
import * as userApi from '../api/userApi';

import User from '../components/View/User.vue';
import Gifts from '../components/View/Gifts.vue';
import Modal from '../components/View/Modal.vue';
import ModelModal from '../components/View/ModelModal.vue';
import SortModal from '../components/View/SortModal.vue';

import i18next from 'i18next';
import TelegramModule from '../hooks/useTelegram';

const { t } = i18next;

export default defineComponent({
  components: {
    User,
    Gifts,
    Modal,
    ModelModal,
    SortModal,
  },

  setup() {
    const route = useRoute();
    const pageApp = ref('Profile');
    const configApp = ref(getConfig());
    const storeCache = useCacheStore() as any;
    const userApp = useSelector((state) => state.auth.user);

    TelegramModule.hideBackButton();

    const handleLoads = ref(0);
    const isPageLoading = ref(true);

    const UserComp = ref({
      Tld: null as number | null,
      Image: null as string | null,
      Name: "Loading.." as string | null,
      NFTs: 0 as number | null,
    });

    const GiftsComp = ref({
      Loading: true,
      List: [] as any[],
      Searching: false,
      Offset: 0,
      Limit: 24,
      NFTsCount: 0 as number | null,
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
        BackgroundColors: {
          Center: null,
          Around: null,
        },
        BackgroundDropRate: null,
        SymbolName: null,
        SymbolImage: null,
        SymbolDropRate: null,
        ModelNumber: null,
    }) as any;

    const ModalDisconnectWalletComp = ref({
      ModalActive: false,
    });

    const ModalModelComp = ref({
      ModalActive: false,
      ModelsSelected: [],
    });

    const ModalSortComp = ref({
      ModalActive: false,
      SortSelected: '',
      SortItems: {
        latest: { id: 'latest', Title: 'Latest' },
        oldest: { id: 'oldest', Title: 'Oldest' },
        price_low: { id: 'price_low', Title: 'Price: Low to High' },
        price_high: { id: 'price_high', Title: 'Price: High to Low' },
        upgraded: { id: 'upgraded', Title: 'Upgraded' },
        not_upgraded: { id: 'not_upgraded', Title: 'Not Upgraded' },
      },
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

    const GiftPurchasedOffset = ref(10);
    const GiftPurchasedLimit = ref(3);

    const ActiveTab = ref('received');

    const isLoadingMore = ref(false);

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
      const user = route.params.id as any;
      const data = await userApi.get(user);
      if (!data) return;

      UserComp.value.Tld = data.user.Tld;
      UserComp.value.Image = data.user.Photo;
      UserComp.value.Name = data.user.Name;
      UserComp.value.NFTs = data.nft_count;

      resetLocalStorage();
      fetchNftsStacks();
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

    const ModalCompInit = async (arg: any) => {
      if (!arg) return;

      const nft = GiftsComp.value.List.find(gift => gift.uuid === arg);
      if (!nft) return;

      const NftData = storeCache.NftsAppData[nft.gift_ukey];
      if (!NftData) return;

      ModalComp.value.NftId = nft.uuid;
      ModalComp.value.NftStatus = nft.status;
      ModalComp.value.NftKey = NftData.Key;
      ModalComp.value.NftUuid = arg;
      ModalComp.value.NftUniqueKey = NftData.UKey;
      ModalComp.value.NftMedia = NftData.Media;
      ModalComp.value.NftUpgraded = nft.upgrade;
      ModalComp.value.NftUpgradeSupport = NftData.UpgradeSupport;

      GiftTableList.value.OwnerName = UserComp.value.Name as any;
      GiftTableList.value.OwnerAvatar = UserComp.value.Image as any;
      GiftTableList.value.NftDate = unixToDefault(nft.timespan);
      GiftTableList.value.NftPrice = nft.purchase_price;
      GiftTableList.value.NftSupply = `${Math.max(NftData.Supply - NftData.SupplyUsers, 0)} of ${NftData.Supply}`;

      if (nft.nft_old_owner) {
        GiftTableList.value.NftOldOwner = {
          user_full_name: nft.nft_old_owner.user_full_name,
          user_photo: nft.nft_old_owner.user_photo,
        };
      }

      if (nft.upgrade) {
        ModalComp.value.NftName = nft.upgrade.nft_name.name;

        UpgradedNft.value.ModelName =  nft.upgrade.nft_name;
        UpgradedNft.value.ModelImage = nft.upgrade.nft_image;
        UpgradedNft.value.ModelDropRate = nft.upgrade.nft_drop_rate;

        UpgradedNft.value.SymbolName = nft.upgrade.symbol_name;
        UpgradedNft.value.SymbolImage = nft.upgrade.symbol_image;
        UpgradedNft.value.SymbolDropRate = nft.upgrade.symbol_drop_rate;

        UpgradedNft.value.BackgroundName = nft.upgrade.background_name;
        UpgradedNft.value.BackgroundColors = { Center: nft.upgrade.background_colors_center, Around: nft.upgrade.background_colors_around };
        if (!UpgradedNft.value.BackgroundColors) { UpgradedNft.value.BackgroundColors = { Center: null, Around: null }; };
        if (!UpgradedNft.value.BackgroundDropRate) { UpgradedNft.value.BackgroundDropRate = 1.2; };
        UpgradedNft.value.BackgroundDropRate = nft.upgrade.background_drop_rate;

        UpgradedNft.value.ModelNumber = nft.upgrade.seq;
        return true;
      }

      ModalComp.value.NftImage = NftData.ImageMain;
      ModalComp.value.NftName = NftData.Name;
      ModalComp.value.NftRarity = NftData.Rarity;
      ModalComp.value.NftUpgradePrice = NftData.UpgradePrice;
      UpgradedNftClear();

      return true;
    };

    const useModal = async ({ id }: { id: any }) => {
      const init = await ModalCompInit(id);
      if (!init) return;
      ModalComp.value.ModalActive = true;
    };

    const useTransfered = async () => {
      setActiveTab("received");
      fetchNftsStacks();
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
      for (const stack of GiftsComp.value.List) {
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
      resetLocalStorage();
      setActiveTab('received');
    };

    const sendedNft = (id: string) => {
      const giftToUpdate = GiftsComp.value.List.find(gift => gift.id === id);
      if (!giftToUpdate) return;

      giftToUpdate.status = 'sended';
    };

    const removeGift = (id: string) => {
      for (const stack of GiftsComp.value.List) {
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

    const keyFor = (tab: string, sort: string, models: string[]) =>
      `${tab}|${sort}|${models.join(',')}`;

    const fetchNftsStacks = async () => {
      if (GiftsComp.value.Searching) return;
      GiftsComp.value.Searching = true;

      const tab = ActiveTab.value;
      const sort = ModalSortComp.value.SortSelected || 'latest';
      const modelsCsv = ModalModelComp.value.ModelsSelected;
      const cacheKey = keyFor(tab, sort, modelsCsv);

      // Инициализируем кэш-ячейку при первом обращении
      if (!storeCache.UserNFTs[cacheKey]) {
        storeCache.UserNFTs[cacheKey] = { items: [], count: 0, fullyLoaded: false };
      }

      const bucket = storeCache.UserNFTs[cacheKey];

      // Сначала пробуем отдать из кэша порцию PAGE, если там уже что-то есть,
      // но в UI ещё не всё показали.
      const hasEnoughInCache = bucket.items.length > GiftsComp.value.List.length;
      if (hasEnoughInCache) {
        const next = bucket.items.slice(0, GiftsComp.value.List.length + GiftsComp.value.Limit);
        GiftsComp.value.List = next;
        GiftsComp.value.NFTsCount = bucket.count;
        GiftsComp.value.Searching = false;
        return;
      }

      // Если кэш закончился, а ещё не всё выкачано — берём с сервера
      if (!bucket.fullyLoaded) {
        const offset = bucket.items.length;
        const user = route.params.id as any;
        if (!user) return;
        const gifts = await nftApi.getUserGifts(
          user,
          tab,
          sort,
          modelsCsv.join(','),
          offset,
          GiftsComp.value.Limit
        );

        if (gifts) {
          // дописываем в кэш
          bucket.items.push(...gifts.items);
          bucket.count = gifts.count ?? bucket.count;
          if (gifts.items.length < GiftsComp.value.Limit || bucket.items.length >= bucket.count) {
            bucket.fullyLoaded = true;
          }
        }
      }

      // Обновляем UI из кэша
      GiftsComp.value.List = bucket.items.slice(0, GiftsComp.value.List.length + GiftsComp.value.Limit);
      GiftsComp.value.NFTsCount = bucket.count;
      GiftsComp.value.Searching = false;
    };

    /** Смена фильтров/таба — просто меняем ключ; если кэша нет, первая загрузка начнётся с сервера */
    watch([ActiveTab, () => ModalSortComp.value.SortSelected, () => ModalModelComp.value.ModelsSelected.join(',')], () => {
      const tab = ActiveTab.value;
      const sort = ModalSortComp.value.SortSelected || 'latest';
      const models = ModalModelComp.value.ModelsSelected;
      const cacheKey = keyFor(tab, sort, models);

      const bucket = storeCache.UserNFTs[cacheKey];
      if (bucket) {
        GiftsComp.value.List = bucket.items.slice(0, GiftsComp.value.Limit);
        GiftsComp.value.NFTsCount = bucket.count;
      } else {
        GiftsComp.value.List = [];
        GiftsComp.value.NFTsCount = 0;
      }
      fetchNftsStacks();
    });

    const resetLocalStorage = () => {
      storeCache.UserNFTs = {};
    }

    const applyModels = (models: any) => {
      ModalModelComp.value.ModelsSelected = models;
      fetchNftsStacks();
    }

    const applySort = (sort: any) => {
      ModalSortComp.value.SortSelected = sort;
      fetchNftsStacks();
    }

    const clearAll = () => {
      ModalModelComp.value.ModelsSelected = [];
      ModalSortComp.value.SortSelected = '';
      fetchNftsStacks();
    }

    const clearModels = () => {
      ModalModelComp.value.ModelsSelected = [];
      fetchNftsStacks();
    }

    const clearSort = () => {
      ModalSortComp.value.SortSelected = '';
      fetchNftsStacks();
    }

    onMounted(() => {
      pageEmit();
    });

    watch(
      () => storeCache.TelegramData,
      (newValue) => {
        if (newValue?.user) {
          UserCompInit();
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
      isLoadingMore,
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
      useTransferModal,
      closeTransferModal,
      removeGift,
      UpgradedNft,
      upgradedNftModal,
      clearBackgroundName,
      useTransfered,

      ModalDisconnectWalletComp,
      openDisconnectModal,
      closeDisconnectModal,

      fetchNftsStacks,

      ModalModelComp,
      applyModels,

      ModalSortComp,
      applySort,

      clearAll,
      clearModels,
      clearSort,
    };
  }
});
</script>

<style lang="sass">
@use "@/assets/styles/profile/_main.sass"
@use "@/assets/styles/profile/_comp.sass"
</style>