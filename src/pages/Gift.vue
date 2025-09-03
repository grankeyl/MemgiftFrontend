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
import { unixToDefault } from '../utils/useApp';

import * as nftApi from '../api/nftApi';

import TelegramModule from '../hooks/useTelegram';

import Content from '../components/Gift/Content.vue';

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

            this.GiftTableList.OwnerName = nft.user_name;
            this.GiftTableList.OwnerAvatar = nft.user_photo;
            this.GiftTableList.NftDate = unixToDefault(nft.timestamp);
            this.GiftTableList.NftPrice = nft.nft_price;
            this.GiftTableList.NftSupply = `${Math.max(nftData.Supply - nftData.SupplyUsers, 0)} of ${nftData.Supply}`;

            if (nft.upgraded) {
                this.NftData.ModelName = nft.upgrade.nft_name.name;
                this.NftData.ModelNumber = nft.upgrade.seq;
                this.NftData.ModelImage = nft.upgrade.nft_name.image;
                this.NftData.ModelDropRate = nft.upgrade.nft_name.drop_rate;

                this.NftData.SymbolName = nft.upgrade.symbol.name;
                this.NftData.SymbolImage = nft.upgrade.symbol.image;
                this.NftData.SymbolDropRate = nft.upgrade.symbol.drop_rate;

                this.NftData.BackgroundName = nft.upgrade.background.name;
                this.NftData.BackgroundColors = {
                    Center: nft.upgrade.background.colors_center,
                    Around: nft.upgrade.background.colors_around
                }
                this.NftData.BackgroundDropRate = nft.upgrade.background.drop_rate;

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
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/gift/_main.sass"
@use "@/assets/styles/gift/_comp.sass"
</style>
