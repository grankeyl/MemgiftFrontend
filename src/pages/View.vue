<template>
  <div class="overlay" :class="{ 'is-open is-dark': ModalModelComp.ModalActive }" @click="ModalModelComp.ModalActive = false" />
  <div class="overlay" :class="{ 'is-open is-dark': ModalSortComp.ModalActive }" @click="ModalSortComp.ModalActive = false" />

  <div class="_wrap _profile flex-grow-scroll" :class="{ desktop: isDesktop() }">
    <div class="bluring-t"></div>
    <div class="bluring-b"></div>

    <div class="_view">
      <div class="display">
        <User
          @loadSuccess="handleLoadSuccess"
          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
          :UserImage="UserComp.Image"
          :UserName="UserComp.Name"
          :UserNftsCount="UserComp.NFTs"
          :UserRank="UserComp.Rank"
          :UserTld="UserComp.Tld"
        />

        <Gifts
          @loadMore="fetchNftsStacks"
          @loadSuccess="handleLoadSuccess"
          @useModal="useModal"
          @openModelModal="ModalModelComp.ModalActive = true"
          @openSortModal="ModalSortComp.ModalActive = true"
          @clearAll="clearAll"
          @clearModels="clearModels"
          @clearSort="clearSort"

          :Skeleton="isPageLoading"
          :SkeletonTime="configApp.skeletonTime"
          :GiftsList="GiftsComp.List"
          :GiftsCount="GiftsComp.NFTsCount"
          :GiftsLoading="GiftsComp.Loading"
          :SelectedModels="ModalModelComp.ModelsSelected"
          :SelectedSort="ModalSortComp.SortSelected"
          :SortItems="ModalSortComp.SortItems"
          :Searching="GiftsComp.Searching"
          :ActiveTab="GiftsTab"
          @useTab="setGiftsTab"
        />
      </div>
    </div>

    <Modal
      @loadSuccess="handleLoadSuccess"
      @closeModal="closeModal"
      @transferNft="transferNft"
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
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { getConfig } from '../config';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { checkLoaded } from '../utils/checkLoaded';
import { unixToDefault } from '../utils/useApp';
import { useRoute, useRouter } from 'vue-router';

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
  components: { User, Gifts, Modal, ModelModal, SortModal },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const pageApp = ref('Profile');
    const configApp = ref(getConfig());
    const storeCache = useCacheStore() as any;

    TelegramModule.hideBackButton();

    const handleLoads = ref(0);
    const isPageLoading = ref(true);

    const UserComp = ref({
      Tld: null as number | null,
      Image: null as string | null,
      Name: "Loading.." as string | null,
      NFTs: 0 as number | null,
      Rank: null as number | null,
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
      GiftName: '',
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
      Market: { MarketOn: false, TonPrice: null, LotId: null }
    });

    const UpgradedNft = ref({
        ModelName: null, ModelImage: null, ModelDropRate: null,
        BackgroundName: null, BackgroundColors: { Center: null, Around: null },
        BackgroundDropRate: null, SymbolName: null, SymbolImage: null, SymbolDropRate: null, ModelNumber: null,
    }) as any;

    const ModalModelComp = ref({ ModalActive: false, ModelsSelected: [] });

    const ModalSortComp = ref({
      ModalActive: false,
      SortSelected: '',
      SortItems: {
        latest: { id: 'latest', Title: 'Latest' },
        oldest: { id: 'oldest', Title: 'Oldest' },
        price_low: { id: 'price_low', Title: 'Price: Low to High' },
        price_high: { id: 'price_high', Title: 'Price: High to Low' },
      },
    });

    const GiftTableList = ref({
      OwnerAvatar: '', OwnerAvatarLoading: false, OwnerName: '', NftDate: '', NftPrice: '',
      NftSupply: `300 ${t('app.supplySubmission')} 1000`,
      NftOldOwner: { user_full_name: 0, user_photo: 0 },
    });

    const pageEmit = () => { checkLoaded((event: string) => (event as any)); };

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
      if (!data) {
        // профиль не загрузился — снимаем загрузку, иначе скелетон навсегда
        GiftsComp.value.Loading = false;
        isPageLoading.value = false;
        return;
      }

      UserComp.value.Tld = data.user.Tld;
      UserComp.value.Image = data.user.Photo;
      UserComp.value.Name = data.user.Name;
      UserComp.value.NFTs = data.nft_count;
      UserComp.value.Rank = data.user.Rank;

      // фильтр изначально не выставляем: запрос и так уходит с сортировкой
      // 'latest' по умолчанию (см. fetchNftsStacks), а чип сверху больше
      // не висит активным на чистой странице
      resetLocalStorage();
      fetchNftsStacks();
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
      // в заголовке нужен сам подарок, а не имя модели
      ModalComp.value.GiftName = NftData.Name;
      ModalComp.value.NftUpgraded = nft.upgrade;
      ModalComp.value.NftUpgradeSupport = NftData.UpgradeSupport;

      GiftTableList.value.OwnerName = UserComp.value.Name as any;
      GiftTableList.value.OwnerAvatar = UserComp.value.Image as any;
      GiftTableList.value.NftDate = unixToDefault(nft.timespan);
      GiftTableList.value.NftPrice = nft.purchase_price;
      GiftTableList.value.NftSupply = `${Math.max(NftData.Supply - NftData.SupplyUsers, 0)} of ${NftData.Supply}`;

      if (nft.nft_old_owner) {
        GiftTableList.value.NftOldOwner = { user_full_name: nft.nft_old_owner.user_full_name, user_photo: nft.nft_old_owner.user_photo };
      }

      if (nft.upgrade) {
        ModalComp.value.NftName = nft.upgrade.nft_name.name;
        UpgradedNft.value.ModelName = nft.upgrade.nft_name;
        UpgradedNft.value.ModelImage = nft.upgrade.nft_image;
        UpgradedNft.value.ModelDropRate = nft.upgrade.nft_drop_rate;
        UpgradedNft.value.SymbolName = nft.upgrade.symbol_name;
        UpgradedNft.value.SymbolImage = nft.upgrade.symbol_image;
        UpgradedNft.value.SymbolDropRate = nft.upgrade.symbol_drop_rate;
        UpgradedNft.value.BackgroundName = nft.upgrade.background_name;
        UpgradedNft.value.BackgroundColors = { Center: nft.upgrade.background_colors_center, Around: nft.upgrade.background_colors_around };
        if (!UpgradedNft.value.BackgroundColors) UpgradedNft.value.BackgroundColors = { Center: null, Around: null };
        if (!UpgradedNft.value.BackgroundDropRate) UpgradedNft.value.BackgroundDropRate = 1.2;
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
      UpgradedNft.value = {
        ModelName: null, ModelImage: null, ModelDropRate: null,
        BackgroundName: null, BackgroundColors: { Center: null, Around: null },
        BackgroundDropRate: null, SymbolName: null, SymbolImage: null, SymbolDropRate: null, ModelNumber: null,
      };
      return true;
    };

    const useModal = async ({ id }: { id: any }) => {
      const init = await ModalCompInit(id);
      if (!init) return;
      ModalComp.value.ModalActive = true;
    };

    const useTransfered = async () => { fetchNftsStacks(); };

    const closeModal = () => { ModalComp.value.ModalActive = false; };

    const closeTransferModal = () => { ModalComp.value.ModalTransferActive = false; };

    const upgradedNftModal = (id: number, model_name: string, model_symbol: string, model_background: string, model_number: number) => {
      for (const stack of GiftsComp.value.List) {
        const gift = stack.stackGifts.find((g: any) => g.id === id);
        if (gift) {
          gift.upgraded = true; gift.model_name = model_name; gift.model_symbol = model_symbol; gift.model_background = model_background; gift.model_number = model_number;
          break;
        }
      }
    };

    const transferNft = async () => { resetLocalStorage(); };


    const removeGift = (id: string) => {
      for (const stack of GiftsComp.value.List) {
        const index = stack.stackGifts.findIndex((g: any) => g.id === id);
        if (index !== -1) { stack.stackGifts.splice(index, 1); break; }
      }
    };

    // таб «Подарки / NFT» — как в своём профиле; входит в ключ кэша,
    // чтобы списки табов не перемешивались
    const GiftsTab = ref<'all' | 'wallet'>('all');

    const keyFor = (sort: string, models: string[]) => `${GiftsTab.value}|${sort}|${models.join(',')}`;

    const setGiftsTab = (tab: 'all' | 'wallet') => {
      if (GiftsTab.value === tab) return;
      GiftsTab.value = tab;
      GiftsComp.value.List = [];
      GiftsComp.value.NFTsCount = 0;
      fetchNftsStacks();
    };

    const fetchNftsStacks = async () => {
      if (GiftsComp.value.Searching) return;
      GiftsComp.value.Searching = true;
      const sort = ModalSortComp.value.SortSelected || 'latest';
      const modelsCsv = ModalModelComp.value.ModelsSelected;
      const cacheKey = keyFor(sort, modelsCsv);

      if (!storeCache.UserNFTs[cacheKey]) storeCache.UserNFTs[cacheKey] = { items: [], count: 0, fullyLoaded: false };
      const bucket = storeCache.UserNFTs[cacheKey];

      const hasEnoughInCache = bucket.items.length > GiftsComp.value.List.length;
      if (hasEnoughInCache) {
        const next = bucket.items.slice(0, GiftsComp.value.List.length + GiftsComp.value.Limit);
        GiftsComp.value.List = next;
        GiftsComp.value.NFTsCount = bucket.count;
        GiftsComp.value.Searching = false;
        GiftsComp.value.Loading = false;
        return;
      }

      if (!bucket.fullyLoaded) {
        const offset = bucket.items.length;
        const user = route.params.id as any;
        if (!user) {
          // без id грузить нечего — снимаем флаг, иначе скелетон навсегда
          GiftsComp.value.Searching = false;
          GiftsComp.value.Loading = false;
          return;
        }
        const gifts = await nftApi.getUserGifts(
          user, '', sort, modelsCsv.join(','), offset, GiftsComp.value.Limit,
          GiftsTab.value === 'wallet' ? 'only' : 'exclude',
        );
        if (gifts) {
          bucket.items.push(...gifts.items);
          bucket.count = gifts.count ?? bucket.count;
          if (gifts.items.length < GiftsComp.value.Limit || bucket.items.length >= bucket.count) bucket.fullyLoaded = true;
        }
      }

      GiftsComp.value.List = bucket.items.slice(0, GiftsComp.value.List.length + GiftsComp.value.Limit);
      GiftsComp.value.NFTsCount = bucket.count;
      GiftsComp.value.Searching = false;
      GiftsComp.value.Loading = false;
    };

    watch([() => ModalSortComp.value.SortSelected, () => ModalModelComp.value.ModelsSelected.join(',')], () => {
      const sort = ModalSortComp.value.SortSelected || 'latest';
      const models = ModalModelComp.value.ModelsSelected;
      const cacheKey = keyFor(sort, models);
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

    const resetLocalStorage = () => { storeCache.UserNFTs = {}; };

    const applyModels = (models: any) => { ModalModelComp.value.ModelsSelected = models; fetchNftsStacks(); };
    const applySort = (sort: any) => { ModalSortComp.value.SortSelected = sort; fetchNftsStacks(); };
    const clearAll = () => { ModalModelComp.value.ModelsSelected = []; ModalSortComp.value.SortSelected = ''; fetchNftsStacks(); };
    const clearModels = () => { ModalModelComp.value.ModelsSelected = []; fetchNftsStacks(); };
    const clearSort = () => { ModalSortComp.value.SortSelected = ''; fetchNftsStacks(); };

    onMounted(() => { pageEmit(); });

    watch(() => storeCache.TelegramData, (newValue) => { if (newValue?.user) UserCompInit(); }, { immediate: true });

    // «назад» вело жёстко в рейтинг — так было, когда на чужой профиль
    // попадали только оттуда. теперь сюда приходят из топа покупателей,
    // со страницы подарка и по ссылке, поэтому возвращаемся по истории,
    // а на запасной путь уходим, только если возвращаться некуда
    TelegramModule.useBackButton(() => {
      if (window.history.state?.back) {
        router.back();
        return;
      }
      router.push('/');
    });

    // в return только то, что реально читает шаблон
    return {
      configApp, storeCache, isPageLoading,
      UserComp, GiftsComp, ModalComp, GiftTableList, UpgradedNft,
      isDesktop, handleLoadSuccess,
      useModal, closeModal, closeTransferModal,
      transferNft, useTransfered, removeGift, upgradedNftModal,
      fetchNftsStacks, ModalModelComp, applyModels, ModalSortComp, applySort,
      clearAll, clearModels, clearSort,
      GiftsTab, setGiftsTab,
    };
  }
});
</script>

<style lang="sass">
@use "@/assets/styles/profile/_main.sass"
@use "@/assets/styles/profile/_comp.sass"
</style>
