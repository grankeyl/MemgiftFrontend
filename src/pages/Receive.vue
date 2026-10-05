<template>
    <Button
        @loadSuccess="handleLoadSuccess"
        @shareGift="shareGift"
        
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :ButtonType="NftType"
        :NftUniqueKey="NftUniqueKey"
        :NftPrice="NftData?.Price"
    />

    <div class="_wrap _receive" :class="{ desktop: isDesktop() }">
        <div class="_view">

            <Purchased
                v-if="NftType === 'purchased'"

                @loadSuccess="handleLoadSuccess"
                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftKey="NftData?.Key"
                :NftMedia="NftData?.Media"
                :NftImage="NftData?.ImageMain"
                :NftRarity="NftData?.Rarity"
                :Text="$t('receive.purchasedText')"
            />

            <Sended
                v-if="NftType === 'sended'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftKey="NftData?.Key"
                :NftMedia="NftData?.Media"
                :NftImage="NftData?.ImageMain"
                :NftRarity="NftData?.Rarity"
                :Text="$t('receive.sendedText')"
            />

            <Received
                v-if="NftType === 'received'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftKey="NftData?.Key"
                :NftMedia="NftData?.Media"
                :NftImage="NftData?.ImageMain"
                :NftRarity="NftData?.Rarity"
                :Text="$t('receive.receivedText')"
            />

            <Notfound
                v-if="NftType === 'notfound'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftKey="NftData?.Key"
                :NftMedia="NftData?.Media"
                :NftImage="NftData?.ImageMain"
                :Text="$t('receive.notfoundText')"
            />

            <Selfed
                v-if="NftType === 'selfed'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftKey="NftData?.Key"
                :NftMedia="NftData?.Media"
                :NftImage="NftData?.ImageMain"
                :Text="$t('receive.selfedText')"
            />

        </div>
    </div>
</template>
  
<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { shootConfetti } from '../utils/useConfetti';
import { Icon } from '../components/Icon';
import { getConfig } from '../config';

import Image_ReceivedGift from '../assets/images/received-gift.gif';

import Purchased from '../components/Receive/Purchased.vue';
import Received from '../components/Receive/Received.vue';
import Sended from '../components/Receive/Sended.vue';
import Notfound from '../components/Receive/Notfound.vue';
import Selfed from '../components/Receive/Selfed.vue';
import Button from '../components/Receive/Button.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Purchased,
        Received,
        Sended,
        Notfound,
        Selfed,
        Button,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),

            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            NftUniqueKey: '' as string,
            NftType: 'notfound' as string,

            NftData: {} as any,

            Icon,
            isDesktop,

            Image_ReceivedGift,
        };
    },

    mounted() {
        TelegramModule.useBackButton(
            () => this.$router.push('/')
        );

        this.checkNft();
        this.getNftData();

        this.$watch(() => this.storeCache.NftsAppData, () => {
            this.getNftData();
        });
    },

    methods: {
        shareGift() {
            const key = String(this.NftUniqueKey || '').replace(/ /g, '');
            const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=cln_${key}`;
            TelegramModule.useShare(url, this.$t('receive.purchasedText'));
        },

        handleLoadSuccess() {
            this.handleLoads ++;

            if (this.handleLoads >= 2) {
                setTimeout(() => {
                    this.isPageLoading = false;
                    TelegramModule.useMediumHaptic();
                    // салют уместен только когда подарок реально получен
                    if (['purchased', 'received'].includes(String(this.NftType))) {
                        shootConfetti();
                    }
                }, this.configApp.skeletonTime);
            };
        },
        
        checkNft() {
            const nft = this.$route.params.nft;
            if (!nft) return;

            const nftType = this.$route.params.nftType;
            if (!nftType) return;

            this.NftUniqueKey = nft as string;
            this.NftType = nftType as string;
            
            return nft;
        },

        getNftData() {
            try {
                const nftKey = this.NftUniqueKey;
                const nftData = this.storeCache.NftsAppData[nftKey];
                if (!nftData) return;
                this.NftData = nftData;
            } catch {}
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/receive/_main.sass"
@use "@/assets/styles/receive/_comp.sass"
</style>
