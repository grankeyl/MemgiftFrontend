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
        :Terms="Terms"

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
                    :NftKey="NftData?.Key"
                    :NftGetFree="NftData?.NftGetFree"
                    :Terms="Terms"
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
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),

            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

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
    },

    computed: {
        NftSupplyCurrent(): number {
            return (this.NftData?.Supply ?? 0) - (this.NftSupplyCurrent ?? 0);
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
            this.IntervalCheckGifts = setTimeout(async () => {
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

        completeTerm(type: 'InviteFriends' | 'ShareChats' | 'SubscribedChannel') {
            console.log(this.Terms);
            if (!type) return;
            this.Terms[type] = true;
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
