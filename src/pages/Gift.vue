<template>
    <div class="_wrap _pageGift" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <Content
                @loadSuccess="handleLoadSuccess"
                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :NftData="NftData"
                :Table="GiftTableList"
            />
        </div>
    </div>
</template>
  
<script lang="ts">
import { useCacheStore } from '../stores/pinia/piniaStore';
import { getConfig } from '../config';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';

import * as nftApi from '../api/nftApi';

import TelegramModule from '../hooks/useTelegram';

import Content from '../components/Gift/Content.vue';
import { getUpgradedModel, getUpgradedSymbol } from '../utils/useGift';
import { unixToDefault } from '../utils/useApp';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Content,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),

            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            NftData: {} as any,
            GiftTableList: {} as any,

            Icon,
            isDesktop,
        };
    },

    mounted() {
        if (this.$route.query.type === 'viewPage') {
            TelegramModule.useBackButton(() => this.$router.push('/view/' + this.$route.query.key));
        } else {
            TelegramModule.useBackButton(() => this.$router.push('/'));
        }

        const uuid = this.$route.params.id as string | undefined;
        if (!uuid) return;
        this.getGiftData(uuid);
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

        async getGiftData(uuid: string) {
            const nft = await nftApi.getGift(uuid);
            if (!nft) return;

            const nftData = this.storeCache.NftsAppData[nft.nft_unique_key];
            if (!nftData) return;

            this.NftData = nft;
            this.NftData.NftRarity = nftData.Rarity;

            console.log(nft);

            this.GiftTableList.OwnerName = nft.name;
            this.GiftTableList.OwnerAvatar = nft.photo;
            this.GiftTableList.NftDate = unixToDefault(nft.timestamp);
            this.GiftTableList.NftPrice = nft.nft_price;
            this.GiftTableList.NftSupply = `${Math.max(nftData.Supply - nftData.SupplyUsers, 0)} of ${nftData.Supply}`;

            if (nft.upgraded) {
                this.NftData.ModelName = nft.nftModelName;
                this.NftData.ModelNumber = nft.nftModelNumber;
                this.NftData.ModelImage = getUpgradedModel(nft.nftUniqueKey, nft.nftModelName);

                this.NftData.SymbolName = nft.nftModelSymbol;
                this.NftData.SymbolImage = getUpgradedSymbol(nft.nftModelSymbol);

                this.NftData.BackgroundName = nft.nftModelBackground;

                await this.upgradeNftInfo(
                    nftData.nftUniqueKey,
                    nft.nftModelName, 
                    nft.nftModelSymbol
                );

                if (!this.NftData.BackgroundColors) { this.NftData.BackgroundColors = {}; }
            }

            this.NftData.NftKey = nftData.Key;
            this.NftData.NftUniqueKey = nftData.UKey;
            this.NftData.NftMedia = nftData.Media;
            this.NftData.NftImage = nftData.ImageMain;
            this.NftData.NftName = nftData.Name;
            this.NftData.NftPrice = nftData.Price;
            this.NftData.NftRarity = nftData.Rarity;
            this.NftData.NftUpgradePrice = nftData.UpgradePrice;
        },

        async upgradeNftInfo(
            nftUniqueKey: string,
            modelName: string, 
            modelSymbol: string
        ) {
            const upgradeNft = await nftApi.getNftUpgradeInfo(
                nftUniqueKey,
                modelName,
                modelSymbol
            );
            if (!upgradeNft) {
                this.NftData.ModelDropRate = 1.2;
                this.NftData.SymbolDropRate = 1.4;
            };
            
            this.NftData.ModelDropRate = upgradeNft.ModelDropRate;
            this.NftData.SymbolDropRate = upgradeNft.SymbolDropRate;
        }
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/gift/_main.sass"
@use "@/assets/styles/gift/_comp.sass"
</style>
