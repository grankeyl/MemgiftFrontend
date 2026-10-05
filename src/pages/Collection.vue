<template>
    <div class="bluring-b"></div>

    <Button
        v-if="!NftData?.Locked"
        @loadSuccess="handleLoadSuccess"
        @checkNftFree="checkNftFree"
        @buyCountPlus="buyCountPlus"
        @buyCountMinus="buyCountMinus"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :NftUniqueKey="NftUniqueKey"
        :NftData="NftData"
        :NftBuyCount="NftBuyCount"
        :NftPriceCurrent="NftData?.NftPriceCurrent"
        :NftFree="NftData?.Price === 0"
        :Terms="activeTerms"
        :NftKey="NftData?.Key"

    />

    <ButtonLocked
        v-if="NftData?.Locked"
        @loadSuccess="handleLoadSuccess"
        @checkNftFree="checkNftFree"
        @buyCountPlus="buyCountPlus"
        @buyCountMinus="buyCountMinus"

        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :NftUniqueKey="NftUniqueKey"
        :NftData="NftData"
        :NftBuyCount="NftBuyCount"
        :NftPriceCurrent="NftData?.NftPriceCurrent"
        :NftLocked="NftData?.Locked"
        :Terms="TermsLocked"

    />

    <div class="_wrap _collection" :class="{ desktop: isDesktop() }">
        <div class="_view">

            <div class="_first" :class="{ desktop: isDesktop() }">
                <Gift
                    @loadSuccess="handleLoadSuccess"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"

                    :NftKey="NftData?.Key"
                    :NftSymbols="Image_GiftBg"
                    :NftImage="NftData?.ImageMain"
                    :NftRarity="NftData?.Rarity"
                    :NftTickets="NftData?.Tickets"
                    :NftMedia="NftData?.Media"
                    :NftSaleSupport="NftData?.SaleSupport"
                    :NftSupply="NftSupplyLeft"
                    :NftSupplyMax="NftSupplyAll"
                />
                <Context
                    @loadSuccess="handleLoadSuccess"

                    @buyCountPlus="buyCountPlus"
                    @buyCountMinus="buyCountMinus"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"

                    :NftName="NftData?.Name"
                    :NftCustomEmoji="NftData?.Emoji"
                />
            </div>

            <Terms
                v-if="!NftData?.Price && !NftData?.Locked"
                @loadSuccess="handleLoadSuccess"
                @completeTerm="completeTerm"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :NftKey="NftData?.Key || ('nft_' + NftUniqueKey.toLowerCase())"
                :NftRarity="NftData?.Rarity"
                :NftGetFree="NftData?.NftGetFree"
                :Terms="activeTerms"
            />

            <TermsLocked
                v-if="NftData?.Locked"
                @loadSuccess="handleLoadSuccess"
                @completeTerm="completeTerm"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :NftKey="NftData?.Key"
                :NftRarity="NftData?.Rarity"
                :NftGetFree="NftData?.NftGetFree"
                :Terms="TermsLocked.items"
            />

            <Stats
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :NftUniqueKey="NftUniqueKey"
            />

            <Top
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :TopList="TopList"
            />

        </div>
    </div>
</template>
  
<script lang="ts">
import * as giftsApi from '../api/giftsApi';
import * as nftApi from '../api/nftApi';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { getConfig } from '../config';
import { isDesktop } from '../utils/checkDevice';

import TelegramModule from '../hooks/useTelegram';

import Image_GiftBg from '../assets/gifts/png/gift_bg.png';

import Button from '../components/Collection/Button.vue';
import ButtonLocked from '../components/Collection/ButtonLocked.vue';
import Gift from '../components/Collection/Gift.vue';
import Context from '../components/Collection/Context.vue';
import Terms from '../components/Collection/Terms.vue';
import TermsLocked from '../components/Collection/TermsLocked.vue';
import Top from '../components/Collection/Top.vue';
import Stats from '../components/Collection/Stats.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Button,
        ButtonLocked,
        Gift,
        Context,
        Terms,
        TermsLocked,
        Stats,
        Top,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),

            handleLoads: 0,
            isPageLoading: true,
            isTabVisible: true,

            NftUniqueKey: '' as string,
            
            NftData: {} as any,
            NftSupplyCurrent: 0,
            NftSupplyAll: 0,

            NftBuyCount: 1,
            NftBuyAmount: 100,

            Terms: {
                InviteFriends: false,
                InviteFriendsCount: 0,
                InviteFriendsCountNeed: 5,
                ShareChats: false,
                SubscribedChannel: false,
            },

            TermsScooby: {
                VpnSubscription: false,
                ShareChats: false,
            },

            TermsLocked: {
                items: {
                    hungry_dog: {
                        title: 'HungryDog',
                        image: 'https://memgift.codes/s3/soda/HungryDog.svg',
                        success: false,
                    },
                    burning_panties: {
                        title: 'BurningPanties',
                        image: 'https://memgift.codes/s3/soda/BurningPanties.svg',
                        success: false,
                    },
                    soda: {
                        title: 'Soda',
                        image: 'https://memgift.codes/s3/soda/Soda.svg',
                        success: false,
                    },
                    hot_dog: {
                        title: 'HotDog',
                        image: 'https://memgift.codes/s3/soda/HotDog.svg',
                        success: false,
                    },
                },
                all_success: false,
            } as any,

            IntervalCheckGifts: null as any,
            _onVisibilityChange: null as any,

            RecentList: [],
            TopList: null,

            isDesktop,

            Image_GiftBg,
        };
    },

    mounted() {
        TelegramModule.useBackButton(
            () => this.$router.push('/')
        );

        this.checkNft();
        this.getNftData();
        this.checkCurrentSupply();
        this.checkLockedTerms();
        this.scheduleCheckSupply();

        this.$watch(
            () => this.$route.params.nft,
            (newNft) => {
                if (!newNft) return;
                this.NftUniqueKey = newNft as string;
                this.getNftData();
                this.checkCurrentSupply();
                this.checkLockedTerms();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        );

        this._onVisibilityChange = () => {
            this.isTabVisible = !document.hidden;
            if (this.isTabVisible) {
                this.checkCurrentSupply();
                this.scheduleCheckSupply();
            } else {
                clearTimeout(this.IntervalCheckGifts);
            }
        };
        document.addEventListener('visibilitychange', this._onVisibilityChange);

        this.$watch(() => this.storeCache.NftsAppData, () => {
            this.getNftData();
            this.checkCurrentSupply();
            this.checkLockedTerms();
        });

        this.Terms.InviteFriendsCount = this.storeCache.UserData.RefCount;
        this.$watch(
            () => this.storeCache.UserData,
            () => {
                this.Terms.InviteFriendsCount = this.storeCache.UserData.RefCount;
                this.Terms.InviteFriendsCountNeed = this.Terms.InviteFriendsCount;
            }
        );

        // перебирать нужно TermsLocked.items, а не сам TermsLocked:
        // раньше every() шёл по {items, all_success} и всегда давал false,
        // из-за чего кнопка получения залоченного подарка не разблокировалась
        this.$watch(
            () => this.TermsLocked.items,
            (items: any) => {
                this.TermsLocked.all_success = Object.values(items).every((t: any) => t.success);
            },
            { deep: true, immediate: true }
        );
    },

    beforeUnmount() {
        clearTimeout(this.IntervalCheckGifts);
        if (this._onVisibilityChange) {
            document.removeEventListener('visibilitychange', this._onVisibilityChange);
        }
    },

    computed: {
        isScoobyGift(): boolean {
            return this.NftUniqueKey === 'Scooby' || this.NftData?.Key === 'nft_scooby';
        },
        activeTerms(): any {
            return this.isScoobyGift ? this.TermsScooby : this.Terms;
        },
        // на карточке показываем остаток тиража, а не количество проданных
        NftSupplyLeft(): number {
            const all = Number(this.NftSupplyAll) || 0;
            const sold = Number(this.NftSupplyCurrent) || 0;
            return Math.max(all - sold, 0);
        },
    },

    methods: {
        handleLoadSuccess() {
            this.handleLoads ++;

            if (this.handleLoads === 3) {
                setTimeout(() => {
                    this.isPageLoading = false;
                }, this.configApp.skeletonTime);
            };
        },
        
        checkNft() {
            const nft = this.$route.params.nft;
            if (!nft) return;

            this.NftUniqueKey = nft as string;

            return nft;
        },

        async checkLockedTerms() {
            // условия есть только у залоченных подарков — на остальных запрос лишний
            if (!this.NftData?.Locked) return;

            const res = await nftApi.sodaLocked();
            if (!res) return;

            for (const key in res) {
                const item = res[key];
                this.TermsLocked.items[key].success = item;
            }
        },

        async getNftData() {
            try {
                const nftKey = this.NftUniqueKey;
                const nftData = this.storeCache.NftsAppData[nftKey];
                if (!nftData) return;
                this.NftData = nftData;
                this.NftBuyAmount = this.NftData?.Price;
                this.NftData.nftPriceCurrent = this.NftData?.Price;
                this.NftData.nftTickets = this.NftData?.Tickets;
                this.NftData.NftGetFree = false;
            } catch {}
        },

        async checkCurrentSupply() {
            const nftResponseData = await giftsApi.get(this.NftData?.ID);
            if (!nftResponseData || !nftResponseData.gift) return;
            this.RecentList = Array.isArray(nftResponseData.history) ? nftResponseData.history : [];
            this.TopList = Array.isArray(nftResponseData.top) ? nftResponseData.top : [];
            this.NftSupplyCurrent = nftResponseData.gift.SupplyUsers;
            this.NftSupplyAll = this.NftData?.Supply;
            this.NftData.nftSupplyCurrent = this.NftSupplyAll - this.NftSupplyCurrent;
        },

        scheduleCheckSupply() {
            clearTimeout(this.IntervalCheckGifts);
            if (!this.isTabVisible) return;
            this.IntervalCheckGifts = setTimeout(async () => {
                if (!this.isTabVisible) return;
                await this.checkCurrentSupply();
                this.scheduleCheckSupply();
            }, 10000);
        },

        buyCountPlus(summary: any) {
            const max = this.NftSupplyAll - this.NftSupplyCurrent;
            this.NftBuyCount = Math.min(max, Math.max(1, this.NftBuyCount + summary));
            this.NftData.nftPriceCurrent = this.NftBuyAmount * this.NftBuyCount;
        },

        buyCountMinus(summary: any) {
            const max = this.NftSupplyAll - this.NftSupplyCurrent;
            this.NftBuyCount = Math.min(max, Math.max(1, this.NftBuyCount - summary));
            this.NftData.nftPriceCurrent = Math.max(this.NftBuyAmount, this.NftData.nftPriceCurrent - this.NftBuyAmount);
        },

        completeTerm(type: string) {
            if (!type) return;
            if (type === 'VpnSubscription') {
                this.TermsScooby.VpnSubscription = true;
            } else if (type === 'ShareChats' && this.isScoobyGift) {
                this.TermsScooby.ShareChats = true;
            } else {
                (this.Terms as any)[type] = true;
            }
        },

        checkNftFree(status: boolean, terms: any) {
            this.NftData.NftGetFree = status;
            this.Terms = terms;
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/collection/_main.sass"
@use "@/assets/styles/collection/_comp.sass"
</style>
