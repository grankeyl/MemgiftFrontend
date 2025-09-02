<template>
    <div class="_wrap _activity" :class="{ desktop: isDesktop() }">
        <div class="_view">

            <div class="_second">
                <div class="_title">
                    <h4>{{ $t('collection.recentsTitle') }}</h4>
                </div>

                <Recent 
                    @loadSuccess="handleLoadSuccess"
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                />
            </div>

        </div>
    </div>
</template>
  
<script lang="ts">
import { useCacheStore } from '../stores/pinia/piniaStore';
import { getConfig } from '../config';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';

import TelegramModule from '../hooks/useTelegram';

import Image_GiftBg from '../assets/gifts/png/gift_bg.png';

import Recent from '../components/Activity/Recent.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Recent,
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
            NftSupplyCurrent: 0,
            NftBuyCount: 1,
            NftBuyAmount: 100,

            isUseTickets: false,
            useTicketsCount: 0,

            RecentList: [
                {
                    id: 1,
                    RecentName: "Test1",
                    RecentTime: "today at 23:45",
                    RecentPrice: 5000,
                },
                {
                    id: 2,
                    RecentName: "Test2",
                    RecentTime: "today at 22:45",
                    RecentPrice: 5000,
                },
                {
                    id: 3,
                    RecentName: "Test3",
                    RecentTime: "today at 21:45",
                    RecentPrice: 5000,
                }
            ],

            Icon,
            isDesktop,

            Image_GiftBg,
        };
    },

    mounted() {
        TelegramModule.useBackButton(
            () => this.$router.push('/')
        );
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
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/activity/_main.sass"
@use "@/assets/styles/activity/_comp.sass"
</style>
