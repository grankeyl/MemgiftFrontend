<template>
    <div class="_wrap _market" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <div class="bg"></div>
                <div class="basket">
                    <div class="image">
                        <img src="/market/basket-black.svg" alt="basket" />
                    </div>
                    <div class="context">
                        <h4>10 TON</h4>
                        <p>1 item</p>
                    </div>
                </div>
            <div class="display">
                <div class="logotype">
                    <img src="/market/logotype.svg" alt="logotype" />
                </div>
                <Tabs
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :Tabs="Tabs"
                />
                <Filters
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                />
                <Gifts
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                />
            </div>
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

import Tabs from '../components/Market/Tabs.vue';
import Filters from '../components/Market/Filters.vue';
import Gifts from '../components/Market/Gifts.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Tabs,
        Filters,
        Gifts,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),
            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            Tabs: {
                Active: 'gifts',
                List: [
                    { id: 'gifts' },
                    { id: 'listings' }
                ]
            },

            isDesktop,
            Icon,
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
                    TelegramModule.useMediumHaptic();
                    shootConfetti();
                }, this.configApp.skeletonTime);
            };
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/market/_main.sass"
@use "@/assets/styles/market/_comp.sass"
</style>
