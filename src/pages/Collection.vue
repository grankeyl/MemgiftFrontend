<template>
    <Button
        v-if="!NftData?.Locked"
        @loadSuccess="handleLoadSuccess"
        @checkNftFree="checkNftFree"
        
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :NftUniqueKey="NftUniqueKey"
        :NftData="NftData"
        :NftBuyCount="NftBuyCount"
        :NftPriceCurrent="NftData?.NftPriceCurrent"
        :NftFree="NftData?.Price === 0"
        :Terms="activeTerms"
        :NftKey="NftData?.Key"

        :isUseTickets="isUseTickets"
        :useTicketsCount="useTicketsCount"
    />

    <ButtonLocked
        v-if="NftData?.Locked"
        @loadSuccess="handleLoadSuccess"
        @checkNftFree="checkNftFree"
        
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :NftUniqueKey="NftUniqueKey"
        :NftData="NftData"
        :NftBuyCount="NftBuyCount"
        :NftPriceCurrent="NftData?.NftPriceCurrent"
        :NftLocked="NftData?.Locked"
        :Terms="TermsLocked"

        :isUseTickets="isUseTickets"
        :useTicketsCount="useTicketsCount"
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
                />
                <Context 
                    @loadSuccess="handleLoadSuccess"

                    @buyCountPlus="buyCountPlus"
                    @buyCountMinus="buyCountMinus"
                    @useTickets="useTickets"
                    
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"

                    :Description="$t('collection.description')"

                    :NftName="NftData?.Name"
                    :NftSupply="NftSupplyCurrent"
                    :NftSupplyMax="NftSupplyAll"
                    :NftPrice="NftData?.Price"
                    :NftBuyCount="NftBuyCount"
                    :NftSaleSupport="NftData?.SaleSupport"
                    :NftCustomEmoji="NftData?.Emoji"
                    :NftLocked="NftData?.Locked"
                />
            </div>

            <div v-if="!NftData?.Price && !NftData?.Locked" class="_second">
                <div class="_title">
                    <h4>{{ $t('collection.terms.termsTitle') }}</h4>
                </div>

                <Terms
                    @loadSuccess="handleLoadSuccess"
                    @completeTerm="completeTerm"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :NftKey="NftData?.Key || ('nft_' + NftUniqueKey.toLowerCase())"
                    :NftGetFree="NftData?.NftGetFree"
                    :Terms="activeTerms"
                />
            </div>

            <div v-if="NftData?.Locked" class="_second">
                <div class="_title">
                    <h4>{{ $t('collection.terms.termsTitle') }}</h4>
                </div>

                <TermsLocked
                    @loadSuccess="handleLoadSuccess"
                    @completeTerm="completeTerm"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :NftKey="NftData?.Key"
                    :NftGetFree="NftData?.NftGetFree"
                    :Terms="TermsLocked.items"
                />
            </div>

            <div class="_second">
                <Ads 
                    @loadSuccess="handleLoadSuccess"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                />
            </div>

            <div v-if="similarGifts.length > 0" class="_second">
                <div class="_title">
                    <h4>{{ $t('collection.similarTitle') }}</h4>
                </div>
                <SimilarGifts
                    @loadSuccess="handleLoadSuccess"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"

                    :NftRarity="NftData?.Rarity"
                    :NftKey="NftData?.Key"
                />
            </div>

            <div class="_second">
                <div class="_title">
                    <h4>{{ $t('collection.recentsTitle') }}</h4>
                </div>

                <Recent 
                    @loadSuccess="handleLoadSuccess"

                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"

                    :NftKey="NftData?.Key"
                    :RecentList="RecentList"
                />
            </div>

        </div>
    </div>
</template>
  
<script lang="ts">
import * as giftsApi from '../api/giftsApi';
import * as nftApi from '../api/nftApi';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { getConfig } from '../config';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';

import TelegramModule from '../hooks/useTelegram';

import Image_GiftBg from '../assets/gifts/png/gift_bg.png';

import Button from '../components/Collection/Button.vue';
import ButtonLocked from '../components/Collection/ButtonLocked.vue';
import Gift from '../components/Collection/Gift.vue';
import Context from '../components/Collection/Context.vue';
import Terms from '../components/Collection/Terms.vue';
import TermsLocked from '../components/Collection/TermsLocked.vue';
import Recent from '../components/Collection/Recent.vue';
import Ads from '../components/Collection/Ads.vue';
import SimilarGifts from '../components/Collection/SimilarGifts.vue';

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
        Recent,
        Ads,
        SimilarGifts,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),

            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,
            isTabVisible: true,

            NftUniqueKey: '' as string,
            
            NftData: {} as any,
            NftResponseData: {} as any,
            NftSupplyCurrent: 0,
            NftSupplyAll: 0,

            NftBuyCount: 1,
            NftBuyAmount: 100,

            isUseTickets: false,
            useTicketsCount: 0,

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

            Icon,
            isDesktop,

            Image_GiftBg,
        };
    },

    mounted() {
        TelegramModule.useBackButton(
            () => this.$router.push('/')
        );

        this.checkNft();
        this.checkLockedTerms();
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

        this.$watch(
            () => this.TermsLocked,
            () => {
                this.TermsLocked.all_success = Object.values(this.TermsLocked).every((t: any) => t.success);
            }
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
        NftSupplyCurrent(): number {
            return (this.NftData?.Supply ?? 0) - (this.NftSupplyCurrent ?? 0);
        },
        similarGifts() {
            const all = this.storeCache.NftsApp;
            if (!all || !this.NftData?.Rarity) return [];
            const arr = Array.isArray(all) ? all : Object.values(all);
            return arr.filter((g: any) => g.Rarity === this.NftData.Rarity && g.Key !== this.NftData.Key && !g.soldOut).slice(0, 6);
        },
    },

    methods: {
        handleLoadSuccess() {
            this.handleLoads ++;

            if (this.handleLoads >= 5) {
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
            this.RecentList = nftResponseData.history;
            this.NftResponseData = nftResponseData.gift;
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

        isTicketsNotNull(summary: any) {
            return summary > 0;
        },

        useTickets(summary: any) {
            this.isUseTickets = this.isTicketsNotNull(summary);
            this.useTicketsCount = summary;
        },

        completeTerm(type: string) {
            if (!type) return;
            if (type === 'VpnSubscription') {
                this.TermsScooby.VpnSubscription = true;
            } else if (type === 'ShareChats' && this.isScoobyGift) {
                this.TermsScooby.ShareChats = true;
            } else {
                this.Terms[type] = true;
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
