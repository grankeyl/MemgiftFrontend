<template>
    <div class="_wrap _basket" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <div class="bg"></div>
            <div class="display">
                <ModalConfirm
                    @loadSuccess="handleLoadSuccess"
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                    :ModalActive="ModalConfirmActive"
                />
                <div class="balance">
                    <div class="context">
                    <h4>0.00</h4>
                    <img src="/market/ton.svg" alt="ton" />
                    </div>
                    <div class="button">
                    <img src="/market/plus.svg" alt="plus" />
                    </div>
                </div>
                <div class="block">
                    <Head
                        :Skeleton="isPageLoading"
                        :SkeletonTime="configApp.skeletonTime"
                        :GiftsCount="4033"
                    />
                    <Items
                        :Skeleton="isPageLoading"
                        :SkeletonTime="configApp.skeletonTime"
                    />
                </div>
                <div class="fixed">
                    <div class="clear">
                        <p>Clear All</p>
                        <img src="/market/delete-primary.svg" alt="delete" />
                    </div>
                    <div class="footer" >
                        <div class="inner">
                            <div class="label">
                                <p>Insufficient balance</p>
                            </div>
                            <div class="button" @click="openModalConfirm">
                                <button>
                                    <h4>Buy for 2500</h4>
                                    <img src="/market/ton-white.svg" alt="ton" />
                                </button>
                            </div>
                            <div class="info">
                                <p>2</p>
                                <img src="/market/gift.svg" alt="gift" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { useCacheStore } from '../../stores/pinia/piniaStore';
import { isDesktop } from '../../utils/checkDevice';
import { shootConfetti } from '../../utils/useConfetti';
import { Icon } from '../../components/Icon';
import { getConfig } from '../../config';

import Head from '../../components/Market/Basket/Head.vue';
import Items from '../../components/Market/Basket/Items.vue';
import ModalConfirm from '../../components/Market/Basket/ModalConfirm.vue';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Head,
        Items,
        ModalConfirm,
    },

    data() {
        return {
            storeCache: useCacheStore() as any,
            configApp: getConfig(),
            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            ModalConfirmActive: false,

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

        openModalConfirm() {
            this.ModalConfirmActive = true;
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/market/basket/_main.sass"
@use "@/assets/styles/market/basket/_comp.sass"
</style>
