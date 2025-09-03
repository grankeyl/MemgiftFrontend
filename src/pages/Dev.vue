<template>
    <div class="_wrap _receive" :class="{ desktop: isDesktop() }">
        <div class="_view">

            <Developing
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Text="$t('market.developmentTitle')"
                :Descr="$t('market.developmentDescription')"
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

import Developing from '../components/Dev/Developing.vue'; 

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Developing,
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
        handleLoadSuccess() {
            this.handleLoads ++;

            if (this.handleLoads >= 1) {
                setTimeout(() => {
                    this.isPageLoading = false;
                    TelegramModule.useMediumHaptic();
                    shootConfetti();
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
@use "@/assets/styles/dev/_main.sass"
@use "@/assets/styles/dev/_comp.sass"
</style>
