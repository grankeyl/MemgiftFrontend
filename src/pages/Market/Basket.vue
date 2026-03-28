<template>
    <div class="_wrap _basket" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <div class="bg"></div>
            <div class="display">
                <Notify
                    @unVisible="unVisibleNotifyBuyed"
                    :Title="$t('market.notifyBuyed')"
                    :Button="$t('market.notifyBuyedButton')"
                    :ButtonLink="`/profile`"
                    :Visible="NotifyBuyedVisible"
                />
                <ModalConfirm
                    @loadSuccess="handleLoadSuccess"
                    @closeModal="ModalConfirmActive = false"
                    @deleteLots="deleteLots"
                    @BUYED="BUYED"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :ModalActive="ModalConfirmActive"
                    :ModalSellList="storeCache.Market.Basket.Items"
                    :Selected="SelectedItems"
                />

                <div class="balance" @click="openWallet">
                    <div class="context">
                        <h4>{{ cutNumber(getBalance.toString()) }}</h4>
                        <img :src="TonImg" alt="ton" />
                    </div>
                    <div class="button">
                        <img :src="PlusImg" alt="plus" />
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="!isPageLoading && itemsBasketCount === 0" class="bsk-empty">
                    <div class="bsk-empty__icon">
                        <img :src="BasketWhiteImg" alt="basket" />
                    </div>
                    <h3 class="bsk-empty__title">{{ $t('market.basket.emptyTitle') }}</h3>
                    <p class="bsk-empty__descr">{{ $t('market.basket.emptyDescr') }}</p>
                    <button class="bsk-empty__btn" @click="$router.push('/m')">
                        {{ $t('market.basket.emptyButton') }}
                    </button>
                </div>

                <!-- Filled state -->
                <template v-if="itemsBasketCount > 0">
                    <div class="block">
                        <Head
                            @selectAll="selectAll"
                            @unselectAll="unselectAll"
                            :Skeleton="isPageLoading"
                            :SkeletonTime="configApp.skeletonTime"
                            :GiftsCount="itemsBasketCount"
                            :Selected="SelectedItems"
                        />
                        <Items
                            @select="selectItem"
                            @deleteItem="deleteItem"
                            :Skeleton="isPageLoading"
                            :SkeletonTime="configApp.skeletonTime"
                            :Items="getBasketItems"
                            :Selected="SelectedItems"
                        />
                    </div>

                    <!-- Summary card -->
                    <div v-if="!isPageLoading && SelectedItems.length > 0" class="bsk-summary">
                        <div class="bsk-summary__row">
                            <span class="bsk-summary__label">{{ $t('market.basket.selected') }}</span>
                            <span class="bsk-summary__val">{{ SelectedItems.length }} / {{ itemsBasketCount }}</span>
                        </div>
                        <div class="bsk-summary__row">
                            <span class="bsk-summary__label">{{ $t('market.basket.totalSelected') }}</span>
                            <span class="bsk-summary__val bsk-summary__val--accent">{{ cutNumber(selectedTotal.toString()) }} TON</span>
                        </div>
                        <div class="bsk-summary__row" v-if="SelectedItems.length > 1">
                            <span class="bsk-summary__label">{{ $t('market.basket.avgPrice') }}</span>
                            <span class="bsk-summary__val">~{{ cutNumber(selectedAvg.toString()) }} TON</span>
                        </div>
                        <div class="bsk-summary__row">
                            <span class="bsk-summary__label">{{ $t('market.basket.cheapest') }}</span>
                            <span class="bsk-summary__val">{{ cutNumber(selectedCheapest.toString()) }} TON</span>
                        </div>
                    </div>

                    <div class="fixed">
                        <div class="clear" @click="clearAll">
                            <p>{{ $t('market.basket.clearAll') }}</p>
                            <img :src="DeletePrimaryImg" alt="delete" />
                        </div>
                        <div class="footer" :class="{ error: !checkBalanceAndPrice }">
                            <div class="inner">
                                <div class="label">
                                    <p>{{ $t('market.basket.insufficientBalance') }}</p>
                                </div>
                                <div class="button" @click="openModalConfirm">
                                    <button :disabled="!checkBalanceAndPrice || SelectedItems.length === 0">
                                        <h4>{{ $t('market.basket.buyFor') }} {{ cutNumber(selectedTotal.toString()) }}</h4>
                                        <img :src="TonWhiteImg" alt="ton" />
                                    </button>
                                </div>
                                <div class="info">
                                    <p>{{ SelectedItems.length }}</p>
                                    <img :src="GiftImg" alt="gift" />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
  
<script lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { useCacheStore } from '../../stores/pinia/piniaStore';
import { isDesktop } from '../../utils/checkDevice';
import { Icon } from '../../components/Icon';
import { getConfig } from '../../config';
import { cutNumber } from '../../utils/useTon';

import Head from '../../components/Market/Basket/Head.vue';
import Items from '../../components/Market/Basket/Items.vue';
import Notify from '../../components/Notify/Notify.vue';
import ModalConfirm from '../../components/Market/Basket/ModalConfirm.vue';

import TonImg from '@/assets/images/market/ton.svg';
import PlusImg from '@/assets/images/market/plus.svg';
import DeletePrimaryImg from '@/assets/images/market/delete-primary.svg';
import TonWhiteImg from '@/assets/images/market/ton-white.svg';
import GiftImg from '@/assets/images/market/gift.svg';
import BasketWhiteImg from '@/assets/images/market/basket-white.svg';

const LS_KEY = 'market_basket_v1';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Head,
        Items,
        Notify,
        ModalConfirm,
    },

    data() {
        return {
            TonImg,
            PlusImg,
            DeletePrimaryImg,
            TonWhiteImg,
            GiftImg,
            BasketWhiteImg,

            storeCache: useCacheStore() as any,
            configApp: getConfig(),
            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            ModalConfirmActive: false,
            NotifyBuyedVisible: false,

            SelectedItems: [] as any[],

            isDesktop,
            cutNumber,
            Icon,
        };
    },

    mounted() {
        TelegramModule.useBackButton(
            () => this.$router.push('/')
        );

        this.loadBasketFromLS();
    },

    computed: {
        itemsBasketCount() {
            return this.storeCache.Market.Basket.Items.length;
        },
        getBasketItems() {
            return this.storeCache.Market.Basket.Items;
        },
        summaryTonF() {
            return this.storeCache.Market.Basket.Items.reduce((sum: any, it: any) => sum + (Number(it?.price_ton) || 0), 0);
        },
        summaryTon(): number {
            const items = this.storeCache?.Market?.Basket?.Items ?? [];
            return items.reduce((sum: number, it: any) => sum + (Number(it?.price_ton) || 0), 0);
        },
        selectedItems() {
            return this.storeCache.Market.Basket.Items.filter((it: any) => this.SelectedItems.includes(it.id));
        },
        selectedTotal(): number {
            return this.selectedItems.reduce((sum: number, it: any) => sum + (Number(it?.price_ton) || 0), 0);
        },
        selectedAvg(): number {
            if (!this.SelectedItems.length) return 0;
            return this.selectedTotal / this.SelectedItems.length;
        },
        selectedCheapest(): number {
            if (!this.selectedItems.length) return 0;
            return Math.min(...this.selectedItems.map((it: any) => Number(it?.price_ton) || 0));
        },
        checkBalanceAndPrice(): boolean {
            const balance = this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
            return balance >= this.selectedTotal;
        },
        getBalance(): number {
            return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
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

                if (items.length > 0) {
                    items.forEach((item: any) => {
                        this.SelectedItems.push(item.id);
                    });
                }
            } catch (e) {
                this.storeCache.Market.Basket.Items = [];
                this.storeCache.Market.Basket.Count = 0;
            }
        },

        openModalConfirm() {
            if (this.SelectedItems.length === 0) return;
            this.ModalConfirmActive = true;
        },

        unVisibleNotifyBuyed() {
            this.NotifyBuyedVisible = false;
            this.ModalConfirmActive = false;
        },

        clearAll() {
            this.storeCache.Market.Basket.Items = [];
            this.storeCache.Market.Basket.Count = 0;
            this.SelectedItems = [];
            this.saveBasketToLS();
        },

        selectItem(item: any) {
            if (this.SelectedItems.includes(item)) {
                this.SelectedItems = this.SelectedItems.filter((i: any) => i !== item);
                return;
            };
            this.SelectedItems.push(item);
        },

        selectAll() {
            this.SelectedItems = [];
            this.storeCache.Market.Basket.Items.forEach((item: any) => {
                this.SelectedItems.push(item.id);
            });
        },

        unselectAll() {
            this.SelectedItems = [];
        },

        deleteItem(item: any) {
            this.storeCache.Market.Basket.Items = this.storeCache.Market.Basket.Items.filter((i: any) => i.id !== item.id);
            this.SelectedItems = this.SelectedItems.filter(i => i !== item.id);
            this.saveBasketToLS();
        },

        deleteLots(lots: any) {
            this.storeCache.Market.Basket.Items = this.storeCache.Market.Basket.Items.filter((i: any) => !lots.includes(i.id));
            this.SelectedItems = this.SelectedItems.filter(i => !lots.includes(i));
            this.saveBasketToLS();
        },

        BUYED() {
            this.NotifyBuyedVisible = true

            setTimeout(() => {
                this.storeCache.Market.Basket.Items = [];
                this.storeCache.Market.Basket.Count = 0;
                this.SelectedItems = [];
                this.saveBasketToLS();
                this.$router.push('/m');
            }, 400);
        },

        openWallet() {
            this.$router.push('/wallet');
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/market/basket/_main.sass"
@use "@/assets/styles/market/basket/_comp.sass"
</style>
