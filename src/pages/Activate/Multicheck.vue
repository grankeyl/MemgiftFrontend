<template>
    <Button
        @loadSuccess="handleLoadSuccess"
        
        :Skeleton="isPageLoading"
        :SkeletonTime="configApp.skeletonTime"

        :ButtonType="NftType"
        :NftUniqueKey="NftUniqueKey"
        :NftPrice="NftData?.nftPrice"
    />

    <div class="_wrap _receive" :class="{ desktop: isDesktop() }">
        <div class="_view">

            <Sended
                v-if="NftType === 'sended'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftImage="NftData?.ImageMain || NftData?.nftImages?.imageMain || ''"
                :Text="$t('receiveMulticheck.sendedText')"
                :Descr="$t('receiveMulticheck.sendedDescr')"
            />

            <Received
                v-if="NftType === 'received'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftImage="NftData?.ImageMain || NftData?.nftImages?.imageMain || ''"
                :Text="$t('receiveMulticheck.receivedText')"
                :Descr="$t('receiveMulticheck.receivedDescr')"
            />

            <Notfound
                v-if="NftType === 'notfound'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftImage="NftData?.ImageMain || NftData?.nftImages?.imageMain || ''"
                :Text="$t('receiveMulticheck.notfoundText')"
                :Descr="$t('receiveMulticheck.notfoundDescr')"
            />

            <Selfed
                v-if="NftType === 'selfed'"
                
                @loadSuccess="handleLoadSuccess"

                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"

                :Background="Image_ReceivedGift"
                :NftImage="NftData?.ImageMain || NftData?.nftImages?.imageMain || ''"
                :Text="$t('receiveMulticheck.selfedText')"
                :Descr="$t('receiveMulticheck.selfedDescr')"
            />

        </div>
    </div>
</template>
  
<script lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { useCacheStore } from '../../stores/pinia/piniaStore';
import { isDesktop } from './../../utils/checkDevice';
import { shootConfetti } from './../..//utils/useConfetti';
import { Icon } from './../../components/Icon';
import { getConfig } from './../../config';

import Image_ReceivedGift from '@/assets/images/received-gift.gif';

import Received from '@/components/Activate/Multicheck/Received.vue';
import Sended from '@/components/Activate/Multicheck/Sended.vue';
import Notfound from '@/components/Activate/Multicheck/Notfound.vue';
import Selfed from '@/components/Activate/Multicheck/Selfed.vue';
import Button from '@/components/Activate/Multicheck/Button.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
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
        handleLoadSuccess() {
            this.handleLoads ++;

            if (this.handleLoads >= 2) {
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
@use "@/assets/styles/receive/_main.sass"
@use "@/assets/styles/receive/_comp.sass"
</style>
