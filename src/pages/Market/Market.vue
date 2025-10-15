<template>
    <div class="overlay" :class="{ 'is-open is-dark': ModalModelComp.ModalActive }" @click="ModalModelComp.ModalActive = false" />
    <div class="overlay" :class="{ 'is-open is-dark': ModalGiftModelsComp.ModalActive }" @click="ModalGiftModelsComp.ModalActive = false" />
    <div class="overlay" :class="{ 'is-open is-dark': ModalSortComp.ModalActive }" @click="ModalSortComp.ModalActive = false" />
    <div class="overlay" :class="{ 'is-open is-dark': ModalStatusComp.ModalActive }" @click="ModalStatusComp.ModalActive = false" />
    <div class="overlay" :class="{ 'is-open is-dark': SymbolModelComp.SymbolsActive }" @click="SymbolModelComp.SymbolsActive = false" />
    <div class="overlay" :class="{ 'is-open is-dark': BackdropModelComp.BackdropsActive }" @click="BackdropModelComp.BackdropsActive = false" />
    
    <div class="_wrap _market" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <div class="bg"></div>
            <Notify
                @unVisible="unVisibleNotifyBuyed"
                :Title="$t('market.notifyBuyed')"
                :Button="$t('market.notifyBuyedButton')"
                :ButtonLink="`/profile`"
                :Visible="NotifyBuyedVisible"
            />
            <Modal
                @closeModal="ModalComp.ModalActive = false"
                @notifyBuyed="notifyBuyed"
                @loadSuccess="handleLoadSuccess"
                @addToBasket="addToBasket"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="ModalComp.ModalActive"
                :ModalComp="ModalComp"
            />

            <div 
                class="basket" 
                :class="{ empty: isEmptyBasket }"
                @click="openBasket"
            >
                <div class="image">
                    <img :src="BasketBlackImg" alt="basket" />
                </div>
                <div class="context">
                    <h4>{{ cutNumber(itemsBasketTotal) }} TON</h4>
                    <p>{{ itemsBasketCount }} item</p>
                </div>
            </div>

            <div class="display">
                <div class="logotype">
                    <img :src="LogotypeImg" alt="logotype" />
                </div>
                <Tabs
                    @useTab="setActiveTab"
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :Tabs="Tabs"
                />
                <Filters
                    @loadSuccess="handleLoadSuccess"
                    @openModelModal="ModalModelComp.ModalActive = true"
                    @openGiftModelsModal="openModelGiftModal"
                    @openSortModal="ModalSortComp.ModalActive = true"
                    @openStatusModal="ModalStatusComp.ModalActive = true"
                    @openSymbolModal="openSymbolModal"
                    @openBackdropModal="openBackdropModal"
                    @clearAll="clearAll"
                    @clearModels="clearModels"
                    @clearGiftModels="clearGiftModels"
                    @clearSort="clearSort"
                    @clearStatus="clearStatus"
                    @clearSymbols="clearSymbols"
                    @clearBackdrops="clearBackdrops"

                    :GiftsList="GiftsComp.List"
                    :ActiveTab="Tabs.Active"
                    :GiftsLoading="GiftsComp.Loading"
                    :SelectedModels="ModalModelComp.ModelsSelected"
                    :SelectedGiftModels="ModalGiftModelsComp.ModelsSelected"
                    :SelectedSymbols="SymbolModelComp.SymbolsSelected"
                    :SelectedSort="ModalSortComp.SortSelected"
                    :SelectedStatus="ModalStatusComp.SortSelected"
                    :SelectedBackdrops="BackdropModelComp.BackdropsSelected"
                    :SortItems="ModalSortComp.SortItems"
                    :StatusItems="ModalStatusComp.SortItems"
                    :HasMore="GiftsComp.HasMore"
                />
                <Gifts
                    v-if="Tabs.Active === 'gifts'"
                    @addToBasket="addToBasket"
                    @openGift="openGift"
                    @loadMore="fetchNftsStacks"
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :GiftsList="GiftsComp.List"
                    :Searching="GiftsComp.Searching"
                    :HasMore="GiftsComp.HasMore"
                />
                <Listings
                    v-if="Tabs.Active === 'listings'"
                    @openGift="openGift"
                    @loadMore="fetchListingsStacks"
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :ListingsList="ListingsComp.List"
                    :Searching="ListingsComp.Searching"
                    :HasMore="ListingsComp.HasMore"
                />
            </div>

            <ModelModal
                @closeModal="() => { ModalModelComp.ModalActive = false }"
                @apply="applyModels"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="ModalModelComp.ModalActive"
                :GiftsList="storeCache.NftsAppData"
                :Selected="ModalModelComp.ModelsSelected"
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

            <SortModal
                @closeModal="() => { ModalSortComp.ModalActive = false }"
                @apply="applySort"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="ModalSortComp.ModalActive"
                :ActiveTab="Tabs.Active"
                :SortItems="ModalSortComp.SortItems"
                :Selected="ModalSortComp.SortSelected"
            />

            <StatusModal
                @closeModal="() => { ModalStatusComp.ModalActive = false }"
                @apply="applyStatus"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="ModalStatusComp.ModalActive"
                :ActiveTab="Tabs.Active"
                :SortItems="ModalStatusComp.SortItems"
                :Selected="ModalStatusComp.SortSelected"
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
        </div>
    </div>
</template>
  
<script lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { watch } from 'vue';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { isDesktop } from '../../utils/checkDevice';
import { Icon } from '../../components/Icon';
import { getConfig } from '../../config';
import { cutNumber } from '../../utils/useTon';

import * as MarketLotsApi from '../../api/market/lots';
import * as MarketNftApi from '../../api/market/nft';

import Tabs from '../../components/Market/Tabs.vue';
import Filters from '../../components/Market/Filters.vue';
import Gifts from '../../components/Market/Gifts.vue';
import Listings from '../../components/Market/Listings.vue';
import Modal from '../../components/Market/Modal.vue';
import ModelModal from '../../components/Market/ModelModal.vue';
import ModelModalGift from '../../components/Market/ModelModalGift.vue';
import SortModal from '../../components/Market/SortModal.vue';
import StatusModal from '../../components/Market/StatusModal.vue';
import SymbolModal from '../../components/Market/SymbolModal.vue';
import BackdropModal from '../../components/Market/BackdropModal.vue';
import Notify from '../../components/Notify/Notify.vue';

// Images
import BasketBlackImg from '@/assets/images/market/basket-black.svg';
import LogotypeImg from '@/assets/images/market/logotype.svg';

const LS_KEY = 'market_basket_v1';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Tabs,
        Filters,
        Gifts,
        Listings,
        Modal,
        ModelModal,
        ModelModalGift,
        SortModal,
        StatusModal,
        SymbolModal,
        BackdropModal,
        Notify,
    },

    data() {
        return {
            BasketBlackImg,
            LogotypeImg,

            storeCache: useCacheStore() as any,
            configApp: getConfig(),
            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            Tabs: {
                Active: 'gifts',
                List: [
                    { id: 'gifts' },
                    { id: 'listings' }
                ]
            },

            ModalComp: {
                ModalActive: false,
                BasketStatus: false,
                Info: {},
            },

            ModalSortComp: {
                ModalActive: false,
                SortSelected: '',
                SortItems: {
                    latest: { id: 'latest', Title: 'Latest' },
                    oldest: { id: 'oldest', Title: 'Oldest' },
                    price_low: { id: 'price_low', Title: 'Price: Low to High' },
                    price_high: { id: 'price_high', Title: 'Price: High to Low' },
                },
            },

            ModalStatusComp: {
                ModalActive: false,
                SortSelected: '',
                SortItems: {
                    sold: { id: 'sold', Title: 'Sold' },
                    listing: { id: 'listing', Title: 'Listing' },
                    removed: { id: 'removed', Title: 'Removed' },
                },
            },

            ModalModelComp: {
                ModalActive: false,
                ModelsSelected: [],
            },

            ModalGiftModelsComp: {
                ModalActive: false,
                ModelsList: [] as any[],
                ModelsSelected: [],
            },

            SymbolModelComp: {
                SymbolsActive: false,
                SymbolsList: [] as any[],
                SymbolsSelected: [],
            },

            BackdropModelComp: {
                BackdropsActive: false,
                BackdropsList: [] as any[],
                BackdropsSelected: [],
            },

            GiftsComp: {
                Loading: true,
                List: [] as any[],
                Searching: false,
                Offset: 1,
                Limit: 24,
                NFTsCount: 0 as number | null,
                HasMore: false,
            },

            ListingsComp: {
                Loading: true,
                List: [] as any[],
                Searching: false,
                Offset: 1,
                Limit: 24,
                HasMore: false,
            },

            NotifyBuyedVisible: false,

            isDesktop,
            cutNumber,
            Icon,
        };
    },

    mounted() {
        TelegramModule.useBackButton(
            () => this.$router.push('/')
        );

        this.resetLocalStorage();
        this.fetchNftsStacks();
        this.loadBasketFromLS();

        watch([this.Tabs, () => this.ModalSortComp.SortSelected, () => this.ModalStatusComp.SortSelected, () => this.ModalModelComp.ModelsSelected.join(','), () => this.ModalGiftModelsComp.ModelsSelected.join(','), () => this.SymbolModelComp.SymbolsSelected, () => this.BackdropModelComp.BackdropsSelected], async () => {
            let sortListing = null;
            if (this.Tabs.Active === 'listings') {
                this.ListingsComp.List = [];
                this.ListingsComp.Offset = 1;
                this.ListingsComp.HasMore = false;
                this.ListingsComp.Searching = true;

                if (!this.ModalSortComp.SortSelected || this.ModalSortComp.SortSelected === '') {
                    sortListing = 'latest';
                } else {
                    sortListing = this.ModalSortComp.SortSelected;
                }

                const listings = await MarketLotsApi.listings(
                    this.ModalModelComp.ModelsSelected,
                    this.ModalGiftModelsComp.ModelsSelected,
                    this.SymbolModelComp.SymbolsSelected,
                    this.BackdropModelComp.BackdropsSelected,
                    sortListing,
                    this.ModalStatusComp.SortSelected,
                    this.ListingsComp.Offset,
                    this.ListingsComp.Limit
                );
                if (listings) {
                    this.ListingsComp.List = listings.items;
                    const total = listings.total ?? listings.count ?? 0;
                    this.ListingsComp.HasMore =
                    (total ? this.ListingsComp.List.length < total : listings.items.length === this.ListingsComp.Limit);
                    this.ListingsComp.Offset += 1;
                }
                this.ListingsComp.Searching = false;
                return;
            } else {
                const tab = this.Tabs.Active;
                const sort = this.ModalSortComp.SortSelected || 'latest';
                const models = this.ModalModelComp.ModelsSelected;
                const modelsGift = this.ModalGiftModelsComp.ModelsSelected;
                const symbols = this.SymbolModelComp.SymbolsSelected;
                const backdrops = this.BackdropModelComp.BackdropsSelected;
                const cacheKey = this.keyFor(tab, sort, models, modelsGift, symbols, backdrops);
                const bucket = this.storeCache.UserNFTs[cacheKey];
                if (bucket) {
                    this.GiftsComp.List = bucket.items.slice(0, this.GiftsComp.Limit);
                    this.GiftsComp.NFTsCount = bucket.count;
                } else {
                    this.GiftsComp.List = [];
                    this.GiftsComp.NFTsCount = 0;
                }
                this.GiftsComp.Searching = false;
                this.GiftsComp.Offset = 1;
                this.fetchNftsStacks();
            }
        });
    },

    computed: {
        isEmptyBasket() {
            return this.storeCache.Market.Basket.Items.length === 0;
        },
        itemsBasketCount() {
            return this.storeCache.Market.Basket.Items.length;
        },
        itemsBasketTotal() {
            let total = 0;
            this.storeCache.Market.Basket.Items.forEach((item: any) => {
                total += parseFloat(item.price_ton);
            });
            return total.toString();
        },
    },

    methods: {
        handleLoadSuccess() {
            this.handleLoads ++;

            if (this.handleLoads >= 1) {
                setTimeout(() => {
                    this.isPageLoading = false;
                }, this.configApp.skeletonTime);
            };
        },

        async setActiveTab(arg: string) {
            this.Tabs.Active = arg;
        },

        openBasket() {
            this.$router.push('/m/basket');
        },

        openGift(gift: any) {
            this.ModalComp.Info = gift;
            this.ModalComp.ModalActive = true;
            this.ModalComp.BasketStatus = this.storeCache.Market.Basket.Items
                .some((item: any) => item.id === gift.id);
        },

        addToBasket(gift: any) {
            const idx = this.storeCache.Market.Basket.Items
                .findIndex((item: any) => item.id === gift.id);
            if (idx !== -1) {
                this.storeCache.Market.Basket.Items.splice(idx, 1);
            } else {
                this.storeCache.Market.Basket.Items.push(gift);
            }
            this.storeCache.Market.Basket.Count =
                this.storeCache.Market.Basket.Items.length;
            this.ModalComp.BasketStatus =
                this.storeCache.Market.Basket.Items.some((i: any) => i.id === gift.id);
            this.saveBasketToLS();
        },

        saveBasketToLS() {
            try {
                const payload = {
                items: this.storeCache.Market.Basket.Items,
                count: this.storeCache.Market.Basket.Items.length,
                };
                localStorage.setItem(LS_KEY, JSON.stringify(payload));
            } catch {}
        },

        loadBasketFromLS() {
            try {
                const raw = localStorage.getItem(LS_KEY);
                if (!raw) return;

                const parsed = JSON.parse(raw);
                const items = Array.isArray(parsed?.items) ? parsed.items : [];
                this.storeCache.Market.Basket.Items = items;
                this.storeCache.Market.Basket.Count = items.length;
            } catch (e) {
                this.storeCache.Market.Basket.Items = [];
                this.storeCache.Market.Basket.Count = 0;
            }
        },

        keyFor(tab: string, sort: string, models: string[], modelsGift: string[], symbols: string[], backdrops: string[]) {
            return `${tab}|${sort}|${models.join(',')}|${modelsGift.join(',')}|${symbols.join(',')}|${backdrops.join(',')}`;
        },
        
        async fetchNftsStacks() {
            console.log('1234567')
            if (this.GiftsComp.Searching) return;
            this.GiftsComp.Searching = true;

            const tab = this.Tabs.Active;
            const sort = this.ModalSortComp.SortSelected || 'latest';
            const modelsCsv = this.ModalModelComp.ModelsSelected;
            const modelsGiftCsv = this.ModalGiftModelsComp.ModelsSelected;
            const symbolsCsv = this.SymbolModelComp.SymbolsSelected;
            const backdropsCsv = this.BackdropModelComp.BackdropsSelected;
            const cacheKey = this.keyFor(tab, sort, modelsCsv, modelsGiftCsv, symbolsCsv, backdropsCsv);

            if (!this.storeCache.UserNFTs[cacheKey]) {
                this.storeCache.UserNFTs[cacheKey] = { items: [], count: 0, fullyLoaded: false };
            }

            const bucket = this.storeCache.UserNFTs[cacheKey];

            // ===== 1) Отдаём из кэша, если там уже есть больше, чем показано
            const hasEnoughInCache = bucket.items.length > this.GiftsComp.List.length;
            if (hasEnoughInCache) {
                const next = bucket.items.slice(0, this.GiftsComp.List.length + this.GiftsComp.Limit);
                this.GiftsComp.List      = next;
                this.GiftsComp.NFTsCount = bucket.count;

                // <-- ВАЖНО: считаем HasMore ИЗ КЭША
                const calcHasMoreFromCache =
                bucket.items.length > next.length // в кэше ещё остались элементы на показ
                || (!bucket.fullyLoaded && (bucket.count === 0 || bucket.items.length < bucket.count)); // или сервер ещё не исчерпан

                this.GiftsComp.HasMore   = calcHasMoreFromCache;
                this.GiftsComp.Searching = false;
                return;
            }

            if (!bucket.fullyLoaded) {
                const offset = this.GiftsComp.Offset;
                const gifts = await MarketLotsApi.lots(
                    this.ModalModelComp.ModelsSelected.join(','),
                    this.ModalGiftModelsComp.ModelsSelected.join(','),
                    this.SymbolModelComp.SymbolsSelected.join(','),
                    this.BackdropModelComp.BackdropsSelected.join(','),
                    this.ModalSortComp.SortSelected,
                    offset,
                    this.GiftsComp.Limit
                );
                if (gifts) {
                    bucket.items.push(...gifts.items);
                    bucket.count = gifts.total ?? bucket.count;
                    this.GiftsComp.Offset += 1;
                    if (gifts.items.length < this.GiftsComp.Limit || bucket.items.length >= bucket.count) {
                        bucket.fullyLoaded = true;
                    }
                }
            }

            // ===== 3) Обновляем UI и HasMore (после сервера ИЛИ если сервер ничего не вернул)
            const next = bucket.items.slice(0, this.GiftsComp.List.length + this.GiftsComp.Limit);
            this.GiftsComp.List      = next;
            this.GiftsComp.NFTsCount = bucket.count;

            const calcHasMoreFinal =
                bucket.items.length > next.length
                || (!bucket.fullyLoaded && (bucket.count === 0 || bucket.items.length < bucket.count));

            this.GiftsComp.HasMore   = calcHasMoreFinal;
            this.GiftsComp.Searching = false;
        },

        async fetchListingsStacks() {
            if (this.ListingsComp.Searching || !this.ListingsComp.HasMore) return;
            this.ListingsComp.Searching = true;

            let sortListing = null;

            if (!this.ModalSortComp.SortSelected || this.ModalSortComp.SortSelected === '') {
                sortListing = 'latest';
            } else {
                sortListing = this.ModalSortComp.SortSelected;
            }

            const listings = await MarketLotsApi.listings(
                this.ModalModelComp.ModelsSelected,
                this.ModalGiftModelsComp.ModelsSelected,
                this.SymbolModelComp.SymbolsSelected,
                this.BackdropModelComp.BackdropsSelected,
                sortListing,
                this.ModalStatusComp.SortSelected,
                this.ListingsComp.Offset,
                this.ListingsComp.Limit
            );

            if (listings) {
                this.ListingsComp.List.push(...listings.items);
                const total = listings.total ?? listings.count ?? 0;
                const reachedEndByTotal = total ? this.ListingsComp.List.length >= total : false;
                const reachedEndByPage = listings.items.length < this.ListingsComp.Limit;
                this.ListingsComp.HasMore = !(reachedEndByTotal || reachedEndByPage);
                this.ListingsComp.Offset += 1;
            }

            this.ListingsComp.Searching = false;
        },

        resetLocalStorage() {
            this.storeCache.UserNFTs = {};
        },

        applyModels(models: any) {
            this.ModalModelComp.ModelsSelected = models;
        },

        applyGiftModels(models: any) {
            this.ModalGiftModelsComp.ModelsSelected = models;
        },

        applySort(sort: any) {
            this.ModalSortComp.SortSelected = sort;
        },

        applyStatus(status: any) {
            this.ModalStatusComp.SortSelected = status;
        },

        applySymbols(symbols: any) {
            this.SymbolModelComp.SymbolsSelected = symbols;
        },

        applyBackdrops(backdrops: any) {
            this.BackdropModelComp.BackdropsSelected = backdrops;
        },

        clearAll() {
            this.ModalModelComp.ModelsSelected = [];
            this.ModalGiftModelsComp.ModelsSelected = [];
            this.ModalSortComp.SortSelected = '';
            this.ModalStatusComp.SortSelected = '';
            this.SymbolModelComp.SymbolsSelected = [];
            this.BackdropModelComp.BackdropsSelected = [];
        },

        clearModels() {
            this.ModalModelComp.ModelsSelected = [];
            this.ModalGiftModelsComp.ModelsSelected = [];
        },

        clearGiftModels() {
            this.ModalGiftModelsComp.ModelsSelected = [];
        },

        clearSort() {
            this.ModalSortComp.SortSelected = '';
        },

        clearStatus() {
            this.ModalStatusComp.SortSelected = '';
        },

        clearSymbols() {
            this.SymbolModelComp.SymbolsSelected = [];
        },

        clearBackdrops() {
            this.BackdropModelComp.BackdropsSelected = [];
        },

        async openModelGiftModal() {
            this.ModalGiftModelsComp.ModelsList = [];
            this.ModalGiftModelsComp.ModalActive = true;
            for (const model of this.ModalModelComp.ModelsSelected) {
                const modelName = await MarketNftApi.modelsName(model);
                if (!modelName) return;
                modelName.items.forEach((item: any) => {
                    this.ModalGiftModelsComp.ModelsList.push(item);
                });
            }
        },

        async openSymbolModal() {
            this.SymbolModelComp.SymbolsActive = true;
            const symbols = await MarketLotsApi.symbols();
            if (!symbols) return;
            this.SymbolModelComp.SymbolsList = symbols;
        },

        async openBackdropModal() {
            this.BackdropModelComp.BackdropsActive = true;
            const backdrops = await MarketLotsApi.backdrops();
            if (!backdrops) return;
            this.BackdropModelComp.BackdropsList = backdrops;
        },

        unVisibleNotifyBuyed(id: string) {
            console.log(id);
            this.NotifyBuyedVisible = false;
            this.ModalComp.ModalActive = false;
        },

        notifyBuyed(id: string) {
            this.GiftsComp.List = this.GiftsComp.List.filter((item: any) => item.id !== id);
            this.NotifyBuyedVisible = true;
            this.ModalComp.ModalActive = false;
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/market/_main.sass"
@use "@/assets/styles/market/_comp.sass"
</style>
