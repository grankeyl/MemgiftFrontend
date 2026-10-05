<template>
    <div v-if="Skeleton" class="_comp _item _stats">
        <div class="_skeleton">
            <div class="_row">
                <div class="_left">
                    <div class="_title-skel _load-shimmer"></div>
                    <div class="_sub-skel _load-shimmer"></div>
                </div>
                <div class="_right">
                    <div class="_price-skel _load-shimmer"></div>
                </div>
                <div class="_go-skel _load-shimmer"></div>
            </div>
        </div>
    </div>

    <button
        v-else-if="hasMarket"
        type="button"
        class="_comp _item _stats _stats-button"
        @click="openMarket"
    >
        <div class="_content">
            <div class="_row">
                <span class="_left">
                    <span class="_title">{{ $t('collection.stats.title') }}</span>
                    <span class="_sub">{{ $t('collection.stats.lots', { n: lotsLabel }) }}</span>
                </span>

                <span class="_right">
                    <span class="_price">
                        <Icon class="kit-icon" v-html="Icon.Gram"></Icon>
                        <b>{{ priceLabel }}</b>
                    </span>
                </span>

                <span class="_go" aria-hidden="true">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M1 1.5 6.5 7 1 12.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </div>
        </div>
    </button>
</template>

<script>
import * as MarketLotsApi from '../../api/market/lots';
import { cutNumber } from '../../utils/useTon';
import { Icon } from '../Icon';

import TelegramModule from '../../hooks/useTelegram';

export default {
    props: {
        Skeleton: { type: Boolean, required: true },
        SkeletonTime: { type: Number, required: true },
        NftUniqueKey: { type: String, required: false, default: '' },
    },

    data() {
        return {
            floorPrice: 0,
            lotsCount: 0,
            fetched: false,

            Icon,
        };
    },

    mounted() {
        this.loadResources();
        this.fetchFloor();
    },

    computed: {
        // нет лотов — блока просто нет, пустой «рынок» хуже, чем его отсутствие.
        // пока запрос в пути тоже не рисуем: карточка лучше появится, чем исчезнет
        hasMarket() {
            return this.fetched && this.lotsCount > 0 && this.floorPrice > 0;
        },

        priceLabel() {
            return cutNumber(String(this.floorPrice));
        },

        lotsLabel() {
            return Number(this.lotsCount || 0).toLocaleString('en-US').replace(/,/g, ' ');
        },

    },

    watch: {
        NftUniqueKey() {
            this.fetched = false;
            this.floorPrice = 0;
            this.lotsCount = 0;
            this.fetchFloor();
        },
    },

    methods: {
        async fetchFloor() {
            const ukey = this.NftUniqueKey;
            if (!ukey) {
                this.fetched = true;
                return;
            }

            // самый дешёвый лот + общее количество за один запрос
            const response = await MarketLotsApi.lots(ukey, '', '', '', 'price_low', 0, 1, '');

            if (this.NftUniqueKey !== ukey) return;

            if (response && Array.isArray(response.items)) {
                this.lotsCount = Number(response.total ?? response.items.length) || 0;
                this.floorPrice = Number(response.items[0]?.price_ton) || 0;
            }

            this.fetched = true;
        },

        openMarket() {
            TelegramModule.useSoftHaptic();
            this.$router.push({ path: '/m', query: { g: this.NftUniqueKey } });
        },

        async loadResources() {
            try {
                await document.fonts.ready;
                this.$emit('loadSuccess');
            } catch (error) {
                console.error(error);
            }
        },
    },
};
</script>
