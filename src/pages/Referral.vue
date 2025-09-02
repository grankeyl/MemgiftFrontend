<template>
    <div class="_wrap _pageReferral" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <Context
                @loadSuccess="handleLoadSuccess"
                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
            />
            
            <Content
                @loadSuccess="handleLoadSuccess"
                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
            />
        </div>
    </div>
</template>
  
<script lang="ts">
import { useCacheStore } from '../stores/pinia/piniaStore';
import { getConfig } from '../config';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';

import TelegramModule from '../hooks/useTelegram';

import Context from '../components/Referral/Context.vue';
import Content from '../components/Referral/Content.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Context,
        Content,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),

            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            Icon,
            isDesktop,
        };
    },

    mounted() {
        TelegramModule.useBackButton(() => this.$router.push('/profile'));
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
@use "@/assets/styles/referral/_main.sass"
@use "@/assets/styles/referral/_comp.sass"
</style>
