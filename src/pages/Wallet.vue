<template>
    <div class="overlay" :class="{ 'is-open is-dark': DepositModal.Active }" @click="DepositModal.Active = false" />
    <div class="overlay" :class="{ 'is-open is-dark': WithdrawModal.Active }" @click="WithdrawModal.Active = false" />

    <div class="_wrap wallet" :class="{ desktop: isDesktop() }">
        <div class="_view">
            <div class="bg"></div>

            <DepositModal
                @deposit="deposit"
                @closeModal="DepositModal.Active = false"
                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="DepositModal.Active"
            />

            <WithdrawModal
                @withdraw="withdraw"
                @closeModal="WithdrawModal.Active = false"
                :Skeleton="isPageLoading"
                :SkeletonTime="configApp.skeletonTime"
                :ModalActive="WithdrawModal.Active"
            />

            <div class="display">
                <div class="logotype">
                    <img :src="LogotypeImg" alt="logotype" />
                </div>
                <Blocker
                    @openDeposit="openDeposit"
                    @openWithdraw="openWithdraw"
                    :Skeleton="isPageLoading"
                    :SkeletonTime="configApp.skeletonTime"
                />
                <div class="fixed">
                    <div class="footer">
                        <div class="inner">
                            <div class="button">
                                <button class="back" @click="backToHome">
                                    <h4>{{ $t('wallet.back') }}</h4>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';
import { getConfig } from '../config';

import Blocker from '../components/Wallet/Blocker.vue';
import DepositModal from '../components/Wallet/DepositModal.vue';
import WithdrawModal from '../components/Wallet/WithdrawModal.vue';

// Images
import LogotypeImg from '@/assets/images/wallet/logotype.svg';

export default {
    props: {
        success: {
            type: Boolean,
            required: true,
        },
    },

    components: {
        Blocker,
        DepositModal,
        WithdrawModal,
    },

    data() {
        return {
            LogotypeImg,

            storeCache: useCacheStore() as any,
            configApp: getConfig(),
            handleLoads: 0,
            propsSuccess: this.$props.success,
            isPageLoading: true,

            DepositModal: {
                Active: false,
            },

            WithdrawModal: {
                Active: false,
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
                }, this.configApp.skeletonTime);
            };
        },

        backToHome() {
            this.$router.push('/');
        },

        openDeposit() {
            this.DepositModal.Active = true;
        },

        openWithdraw() {
            this.WithdrawModal.Active = true;
        },

        deposit(amount: any) {
            this.DepositModal.Active = false;
            this.storeCache.UserData.user.Balance.balance_ton = parseFloat(this.storeCache.UserData.user.Balance.balance_ton) + parseFloat(amount);
        },

        withdraw() {
            this.WithdrawModal.Active = false;
        },
    },
};
</script>
  

<style lang="sass">
@use "@/assets/styles/wallet/_main.sass"
@use "@/assets/styles/wallet/_comp.sass"
</style>
