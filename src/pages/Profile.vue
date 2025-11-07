<template>
  <div class="overlay" :class="{ 'is-open': ModalComp.ModalActive }" @click="ModalComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': ModalModelComp.ModalActive }" @click="ModalModelComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': ModalSortComp.ModalActive }" @click="ModalSortComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': ModalSellComp.ModalActive }" @click="ModalSellComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open': ModalComp.ModalTransferActive }" @click="ModalComp.ModalTransferActive = false" />
  <div class="overlay" :class="{ 'is-open': ModalDisconnectWalletComp.ModalActive }" @click="ModalDisconnectWalletComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': ModalGiftModelsComp.ModalActive }" @click="ModalGiftModelsComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': SymbolModelComp.SymbolsActive }" @click="SymbolModelComp.SymbolsActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': BackdropModelComp.BackdropsActive }" @click="BackdropModelComp.BackdropsActive = false" />

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
          :UserRank="storeCache?.UserData?.Rating?.rankNumber"
        />

        <Gifts
          @loadMore="fetchNftsStacks"
          @loadSuccess="handleLoadSuccess"
          @useModal="useModal"
          @useTab="setActiveTab"
          @openModelModal="ModalModelComp.ModalActive = true"
          @openSortModal="ModalSortComp.ModalActive = true"
          @openGiftModelsModal="openGiftModelsModal"
          @openSymbolModal="openSymbolModal"
          @openBackdropModal="openBackdropModal"

          @clearAll="clearAll"
          @clearModels="clearModels"
          @clearSort="clearSort"
          @clearGiftModels="clearGiftModels"
          @clearSymbols="clearSymbols"
          @clearBackdrops="clearBackdrops"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
          :GiftsList="GiftsComp.List"
          :GiftsCount="GiftsComp.NFTsCount"
          :GiftsLoading="GiftsComp.Loading"
          :ActiveTab="ActiveTab"
          :SelectedModels="ModalModelComp.ModelsSelected"
          :SelectedSort="ModalSortComp.SortSelected"
          :SelectedGiftModels="ModalGiftModelsComp.ModelsSelected"
          :SelectedSymbols="SymbolModelComp.SymbolsSelected"
          :SelectedBackdrops="BackdropModelComp.BackdropsSelected"
          :SortItems="ModalSortComp.SortItems"
          :Searching="GiftsComp.Searching"
          :HasMore="GiftsComp.HasMore"
        />
      </div>

      <Modal
        @openSellModal="openSellModal"

        @loadSuccess="handleLoadSuccess"
        @closeModal="closeModal"
        @transferNft="transferNft"
        @sendedNft="sendedNft"
        @useTransferModal="useTransferModal"
        @useTransfered="useTransfered"
        @closeTransferModal="closeTransferModal"
        @upgradedNftModal="upgradedNftModal"
        @removeGift="removeGift"
        @removeGiftLot="removeGiftLot"

        @UPGRADE="UPGRADE"

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


            <ModelModalGift
                @closeModal="() => { ModalGiftModelsComp.ModalActive = false }"
                @apply="applyGiftModels"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="ModalGiftModelsComp.ModalActive"
                :GiftsList="ModalGiftModelsComp.ModelsList"
                :Selected="ModalGiftModelsComp.ModelsSelected"
            />

            <SymbolModal
                @closeModal="() => { SymbolModelComp.SymbolsActive = false }"
                @apply="applySymbols"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="SymbolModelComp.SymbolsActive"
                :GiftsList="SymbolModelComp.SymbolsList"
                :Selected="SymbolModelComp.SymbolsSelected"
            />

            <BackdropModal
                @closeModal="() => { BackdropModelComp.BackdropsActive = false }"
                @apply="applyBackdrops"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="BackdropModelComp.BackdropsActive"
                :GiftsList="BackdropModelComp.BackdropsList"
                :Selected="BackdropModelComp.BackdropsSelected"
            />

      <Notify
        :Title="`Подарок выставлен на продажу`"
        :Button="`Go to Market`"
        :ButtonLink="`/m`"
        :Visible="NotifySellComp.NotifySellActive"
      />
      <SellModal
        @closeModal="() => { ModalSellComp.ModalActive = false }"
        @apply="applySell"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"
        :ModalActive="ModalSellComp.ModalActive"
        :ModalSellList="ModalSellComp.ModalSellList"
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

import * as nftApi from '../api/nftApi';
import * as MarketNftApi from '../api/market/nft';
import * as MarketLotsApi from '../api/market/lots';

import User from '../components/Profile/User.vue';
import Gifts from '../components/Profile/Gifts.vue';
import Modal from '../components/Profile/Modal.vue';
import Button from '../components/Profile/Button.vue';
import DisconnectModal from '../components/Profile/DisconnectModal.vue';
import ModelModal from '../components/Profile/ModelModal.vue';
import SortModal from '../components/Profile/SortModal.vue';
import SellModal from '../components/Profile/SellModal.vue';
import ModelModalGift from '../components/Profile/ModelModalGift.vue';
import SymbolModal from '../components/Profile/SymbolModal.vue';
import BackdropModal from '../components/Profile/BackdropModal.vue';
import Notify from '../components/Notify/Notify.vue';

import i18next from 'i18next';
import TelegramModule from '../hooks/useTelegram';

const { t } = i18next;

export default defineComponent({
  components: {
    User,
    Gifts,
    Modal,
    Button,
    DisconnectModal,
    ModelModal,
    SortModal,
    SellModal,
    ModelModalGift,
    SymbolModal,
    BackdropModal,
    Notify,
  },

  setup() {
    const pageApp = ref('Profile');
    const configApp = ref(getConfig());
    const storeCache = useCacheStore() as any;
    const userApp = useSelector((state) => state.auth.user);

    TelegramModule.hideBackButton();

    const handleLoads = ref(0);
    const isPageLoading = ref(true);

    interface SellItem {
      uuid: string;
      upgraded: boolean;
    }

    const UserComp = ref({
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
      HasMore: false,
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
      Market: {
        MarketOn: false,
        TonPrice: null,
        LotId: null,
      }
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
        on_market: { id: 'on_market', Title: 'On Market' },
        price_low: { id: 'price_low', Title: 'Price: Low to High' },
        price_high: { id: 'price_high', Title: 'Price: High to Low' },
        upgraded: { id: 'upgraded', Title: 'Upgraded' },
        not_upgraded: { id: 'not_upgraded', Title: 'Not Upgraded' },
      },
    });

    const NotifySellComp = ref({
      NotifySellActive: false,
    });
    const ModalSellComp = ref<{
      ModalSellList: SellItem[];
      ModalActive: boolean;
    }>({
      ModalSellList: [],
      ModalActive: false,
    });

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

    const ModalGiftModelsComp = ref({
      ModalActive: false,
      ModelsList: [] as any[],
      ModelsSelected: [],
    });

    const SymbolModelComp = ref({
      SymbolsActive: false,
      SymbolsList: [] as any[],
      SymbolsSelected: [],
    });

    const BackdropModelComp = ref({
      BackdropsActive: false,
      BackdropsList: [] as any[],
      BackdropsSelected: [],
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

      if (handleLoads.value >= 1) {
        setTimeout(() => {
          isPageLoading.value = false;
          storeCache.LoadedData.push(pageApp.value);
        }, 200);
      }
    };

    const UserCompInit = async () => {
      const Image = storeCache.UserData.user.Photo;
      const FullName = storeCache.UserData.user.Name;

      UserComp.value.Image = Image;
      UserComp.value.Name = FullName;
      UserComp.value.NFTs = storeCache.UserData.nft_count;
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

      GiftTableList.value.OwnerName = storeCache.TelegramData.user.firstName;
      GiftTableList.value.OwnerAvatar = storeCache.TelegramData.user.photoUrl;
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

        ModalComp.value.Market.MarketOn = nft.market?.price_ton > 0;
        ModalComp.value.Market.TonPrice = nft.market?.price_ton;
        ModalComp.value.Market.LotId = nft.market?.lot_id;

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

    const useTransfered = (uuid: string) => {
      if (!uuid) return;

      // 1) Удаляем из текущего видимого списка
      const list: any[] = GiftsComp.value.List ?? [];

      // Попытка как по плоскому списку
      let idxFlat = list.findIndex((g: any) => g?.uuid === uuid);
      if (idxFlat !== -1) {
        list.splice(idxFlat, 1);
      } else {
        // Попытка удалить из стеков
        for (let i = list.length - 1; i >= 0; i--) {
          const stack = list[i];
          if (stack?.stackGifts && Array.isArray(stack.stackGifts)) {
            const gi = stack.stackGifts.findIndex((g: any) => g?.uuid === uuid);
            if (gi !== -1) {
              stack.stackGifts.splice(gi, 1);
              // при желании поддерживаем счётчик в самом стаке
              if (typeof stack.count === 'number' && stack.count > 0) {
                stack.count -= 1;
              }
              // удаляем пустой стак полностью
              if (stack.stackGifts.length === 0) {
                list.splice(i, 1);
              }
              break;
            }
          }
        }
      }

      // Обновляем реактивность списка
      GiftsComp.value.List = [...list];

      // Глобальный счётчик на экране
      if (typeof GiftsComp.value.NFTsCount === 'number' && GiftsComp.value.NFTsCount > 0) {
        GiftsComp.value.NFTsCount -= 1;
      }
 
      // 2) Чистим во всех кэш-бакетах
      const cache = storeCache.UserNFTs || {};
      for (const key of Object.keys(cache)) {
        const bucket = cache[key];
        if (!bucket?.items || !Array.isArray(bucket.items)) continue;

        let changed = false;

        // Попытка как по плоскому списку
        const bIdxFlat = bucket.items.findIndex((g: any) => g?.uuid === uuid);
        if (bIdxFlat !== -1) {
          bucket.items.splice(bIdxFlat, 1);
          changed = true;
        } else {
          // Попытка по стекам
          for (let i = bucket.items.length - 1; i >= 0; i--) {
            const s = bucket.items[i];
            if (s?.stackGifts && Array.isArray(s.stackGifts)) {
              const gi = s.stackGifts.findIndex((g: any) => g?.uuid === uuid);
              if (gi !== -1) {
                s.stackGifts.splice(gi, 1);
                if (typeof s.count === 'number' && s.count > 0) s.count -= 1;
                if (s.stackGifts.length === 0) bucket.items.splice(i, 1);
                changed = true;
                break;
              }
            }
          }
        }

        if (changed) {
          if (typeof bucket.count === 'number' && bucket.count > 0) {
            bucket.count -= 1;
          }
          // bucket.fullyLoaded оставляем как есть — это про исчерпанность выдачи на сервере
        }
      }
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

    const removeGiftLot = (id: string) => {
      const nft = GiftsComp.value.List.find(gift => gift.uuid === id);
      if (!nft) return;
      nft.market = null;
    }

    const openDisconnectModal = () => {
      console.log('openDisconnectModal');
      ModalDisconnectWalletComp.value.ModalActive = true;
    };

    const closeDisconnectModal = () => {
      ModalDisconnectWalletComp.value.ModalActive = false;
    };

    const keyFor = (tab: string, sort: string, models: string[], modelsGift: string[], symbols: string[], backdrops: string[]) =>
      `${tab}|${sort}|${models.join(',')}|${modelsGift.join(',')}|${symbols.join(',')}|${backdrops.join(',')}`;
      
    const fetchNftsStacks = async () => {
      if (GiftsComp.value.Searching) return;
      GiftsComp.value.Searching = true;

      const tab = ActiveTab.value;
      const sort = ModalSortComp.value.SortSelected || 'latest';
      const modelsCsv = ModalModelComp.value.ModelsSelected;
      const modelsGiftCsv = ModalGiftModelsComp.value.ModelsSelected;
      const symbolsCsv = SymbolModelComp.value.SymbolsSelected;
      const backdropsCsv = BackdropModelComp.value.BackdropsSelected;
      const cacheKey = keyFor(tab, sort, modelsCsv, modelsGiftCsv, symbolsCsv, backdropsCsv);

      if (!storeCache.UserNFTs[cacheKey]) {
        storeCache.UserNFTs[cacheKey] = { items: [], count: 0, fullyLoaded: false };
      }

      const bucket = storeCache.UserNFTs[cacheKey];

      // ===== 1) Отдаём из кэша, если там уже есть больше, чем показано
      const hasEnoughInCache = bucket.items.length > GiftsComp.value.List.length;
      if (hasEnoughInCache) {
        const next = bucket.items.slice(0, GiftsComp.value.List.length + GiftsComp.value.Limit);
        GiftsComp.value.List      = next;
        GiftsComp.value.NFTsCount = bucket.count;

        // <-- ВАЖНО: считаем HasMore ИЗ КЭША
        const calcHasMoreFromCache =
          bucket.items.length > next.length // в кэше ещё остались элементы на показ
          || (!bucket.fullyLoaded && (bucket.count === 0 || bucket.items.length < bucket.count)); // или сервер ещё не исчерпан

        GiftsComp.value.HasMore   = calcHasMoreFromCache;
        GiftsComp.value.Searching = false;
        return;
      }

      // ===== 2) Если кэш закончился — догружаем с сервера
      if (!bucket.fullyLoaded) {
        const offset = bucket.items.length;
        const gifts = await nftApi.getGifts(
          tab,
          sort,
          modelsCsv.join(','),
          modelsGiftCsv.join(','),
          symbolsCsv.join(','),
          backdropsCsv.join(','),
          offset,
          GiftsComp.value.Limit
        );

        if (gifts) {
          bucket.items.push(...gifts.items);
          bucket.count = gifts.count ?? bucket.count;
          if (gifts.items.length < GiftsComp.value.Limit || bucket.items.length >= bucket.count) {
            bucket.fullyLoaded = true;
          }
        }
      }

      // ===== 3) Обновляем UI и HasMore (после сервера ИЛИ если сервер ничего не вернул)
      const next = bucket.items.slice(0, GiftsComp.value.List.length + GiftsComp.value.Limit);
      GiftsComp.value.List      = next;
      GiftsComp.value.NFTsCount = bucket.count;

      const calcHasMoreFinal =
        bucket.items.length > next.length
        || (!bucket.fullyLoaded && (bucket.count === 0 || bucket.items.length < bucket.count));

      GiftsComp.value.HasMore   = calcHasMoreFinal;
      GiftsComp.value.Searching = false;
    };

    const resetLocalStorage = () => {
      storeCache.UserNFTs = {};
    }

    resetLocalStorage();
    fetchNftsStacks();

    /** Смена фильтров/таба — просто меняем ключ; если кэша нет, первая загрузка начнётся с сервера */
    watch([
      ActiveTab, 
      () => ModalSortComp.value.SortSelected, 
      () => ModalModelComp.value.ModelsSelected.join(','), 
      () => ModalGiftModelsComp.value.ModelsSelected.join(','), 
      () => SymbolModelComp.value.SymbolsSelected.join(','), 
      () => BackdropModelComp.value.BackdropsSelected.join(',')
    ], () => {
      const tab = ActiveTab.value;
      const sort = ModalSortComp.value.SortSelected || 'latest';
      const models = ModalModelComp.value.ModelsSelected;
      const modelsGift = ModalGiftModelsComp.value.ModelsSelected;
      const symbols = SymbolModelComp.value.SymbolsSelected;
      const backdrops = BackdropModelComp.value.BackdropsSelected;
      const cacheKey = keyFor(tab, sort, models, modelsGift, symbols, backdrops);

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

    const applyModels = (models: any) => {
      ModalModelComp.value.ModelsSelected = models;
      fetchNftsStacks();
    }

    const applySort = (sort: any) => {
      ModalSortComp.value.SortSelected = sort;
      fetchNftsStacks();
    }

    const applyGiftModels = (models: any) => {
      ModalGiftModelsComp.value.ModelsSelected = models;
      fetchNftsStacks();
    }

    const applySymbols = (symbols: any) => {
      SymbolModelComp.value.SymbolsSelected = symbols;
      fetchNftsStacks();
    }

    const applyBackdrops = (backdrops: any) => {
      BackdropModelComp.value.BackdropsSelected = backdrops;
      fetchNftsStacks();
    }

    const applySell = (item: any) => {
      NotifySellComp.value.NotifySellActive = true;
      ModalSellComp.value.ModalActive = false;

      const nft = GiftsComp.value.List.find(gift => gift.uuid === item.gift_uuid);
      if (!nft) return;
      nft.market = { price_ton: item.price_ton, lot_id: item.lot_id };
    }
    
    const openGiftModelsModal = async () => {
      ModalGiftModelsComp.value.ModelsList = [];
      ModalGiftModelsComp.value.ModalActive = true;
      for (const model of ModalModelComp.value.ModelsSelected) {
        const modelName = await MarketNftApi.modelsName(model);
        if (!modelName) return;
        modelName.items.forEach((item: any) => {
          ModalGiftModelsComp.value.ModelsList.push(item);
        });
      }
    }

    const openSymbolModal = async () => {
      SymbolModelComp.value.SymbolsActive = true;
      const symbols = await MarketLotsApi.symbols();
      if (!symbols) return;
      SymbolModelComp.value.SymbolsList = symbols;
    }

    const openBackdropModal = async () => {
      BackdropModelComp.value.BackdropsActive = true;
      const backdrops = await MarketLotsApi.backdrops();
      if (!backdrops) return;
      BackdropModelComp.value.BackdropsList = backdrops;
    }

    const clearAll = () => {
      ModalModelComp.value.ModelsSelected = [];
      ModalSortComp.value.SortSelected = '';
      ModalGiftModelsComp.value.ModelsSelected = [];
      SymbolModelComp.value.SymbolsSelected = [];
      BackdropModelComp.value.BackdropsSelected = [];
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

    const clearGiftModels = () => {
      ModalGiftModelsComp.value.ModelsSelected = [];
      fetchNftsStacks();
    }

    const clearSymbols = () => {
      SymbolModelComp.value.SymbolsSelected = [];
      fetchNftsStacks();
    }

    const clearBackdrops = () => {
      BackdropModelComp.value.BackdropsSelected = [];
      fetchNftsStacks();
    }

    const UPGRADE = (data: any) => {
      const nft = GiftsComp.value.List.find(gift => gift.uuid === data.GiftUuid);
      if (nft) {
        nft.media = data.GiftMedia;
        nft.upgraded = true;
        nft.upgrade = {
          "id": data.id,
          "seq": data.seq,
          "background_name": data.background?.name,
          "background_unique_name": data.background?.unique_name,
          "background_colors_center": data.background?.colors_center,
          "background_colors_around": data.background?.colors_around,
          "symbol_name": data.symbol?.name,
          "symbol_unique_name": data.symbol?.unique_name,
          "symbol_image": data.symbol?.image,
          "nft_name": data.nft_name?.name,
          "nft_image": data.nft_name?.image,
          "nft_drop_rate": data.nft_name?.drop_rate,
          "symbol_drop_rate": data.symbol?.drop_rate,
          "background_drop_rate": data.background?.drop_rate
        };
      };
      UpgradedNft.value = {
        ModelName: data.nft_name?.name ?? null,
        ModelImage: data.nft_name?.image ?? null,
        ModelDropRate: data.nft_name?.drop_rate ?? null,
        BackgroundName: data.background?.name ?? null,
        BackgroundColors: {
          Center: data.background?.colors_center ?? null,
          Around: data.background?.colors_around ?? null,
        },
        BackgroundDropRate: data.background?.drop_rate ?? null,
        SymbolName: data.symbol?.name ?? null,
        SymbolImage: data.symbol?.image ?? null,
        SymbolDropRate: data.symbol?.drop_rate ?? null,
        ModelNumber: data.seq ?? null,
      };
    }

    const openSellModal = (item: SellItem) => {
      ModalSellComp.value.ModalSellList = [item];
      ModalSellComp.value.ModalActive = true;
    };

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

      NotifySellComp,
      ModalSellComp,
      openSellModal,
      applySell,

      clearAll,
      clearModels,
      clearSort,

      removeGiftLot,

      ModalGiftModelsComp,
      applyGiftModels,

      SymbolModelComp,
      applySymbols,

      BackdropModelComp,
      applyBackdrops,

      clearGiftModels,
      clearSymbols,
      clearBackdrops,

      openSymbolModal,
      openBackdropModal,
      openGiftModelsModal,

      UPGRADE,
    };
  }
});
</script>

<style lang="sass">
@use "@/assets/styles/profile/_main.sass"
@use "@/assets/styles/profile/_comp.sass"
</style>