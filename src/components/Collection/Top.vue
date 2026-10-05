<template>
    <div v-if="isLoading" class="_comp _item _topBuyers blockTasks">
        <div class="_skeleton">
            <div class="_section-head">
                <h4>{{ $t('collection.top.title') }}</h4>
            </div>
            <div class="other-list">
                <div class="other-user" v-for="i in 4" :key="i">
                    <div class="small-avatar _load-shimmer"></div>
                    <div class="info">
                        <div class="_name-skel _load-shimmer"></div>
                    </div>
                    <div class="_count-skel _load-shimmer"></div>
                </div>
            </div>
        </div>

    </div>

    <div v-else-if="rows.length" class="_comp _item _topBuyers blockTasks">
        <div class="_content">
            <div class="_section-head">
                <h4>
                    {{ $t('collection.top.title') }}
                    <b>({{ rows.length }})</b>
                </h4>
            </div>

            <div class="other-list">
                <div
                    v-for="(row, index) in rows"
                    :key="row.key"
                    class="other-user rt-row"
                    :class="{ clickable: !!row.tld }"
                    :style="{ animationDelay: (index * 0.03) + 's' }"
                    @click="openProfile(row)"
                >
                    <img
                        v-if="row.photo"
                        :src="row.photo"
                        :alt="row.name"
                        class="small-avatar"
                        loading="lazy"
                        @error="hidePhoto(row)"
                    />
                    <div v-else class="small-avatar avatar_null">
                        <h4>{{ row.initial }}</h4>
                    </div>

                    <div class="info">
                        <div class="name">{{ row.name }}</div>
                    </div>

                    <div class="count">
                        <Icon class="kit-icon" v-html="Icon.Gift"></Icon>
                        <span>{{ row.countLabel }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { cleanString } from '../../utils/useApp';
import { Icon } from '../Icon';

export default {
    props: {
        Skeleton: { type: Boolean, required: true },
        SkeletonTime: { type: Number, required: true },
        // null означает «данные ещё не пришли» — в этом состоянии
        // показываем скелетон, а не пустоту
        TopList: { type: Array, required: false, default: null },
    },

    data() {
        return {
            brokenPhotos: [],

            Icon,
        };
    },

    mounted() {
        this.loadResources();
    },

    computed: {
        isLoading() {
            return this.Skeleton || this.TopList === null;
        },

        rows() {
            if (!Array.isArray(this.TopList)) return [];

            return this.TopList
                .filter(item => item && Number(item.count) > 0)
                .map((item, idx) => ({
                    key: `${item.userName || 'anon'}-${idx}`,
                    tld: item.userTld ? String(item.userTld) : '',
                    name: cleanString(item.userName || '').trim() || 'No Name',
                    initial: this.getInitial(item.userName),
                    photo: item.userPhoto && !this.brokenPhotos.includes(item.userPhoto)
                        ? item.userPhoto
                        : '',
                    rawPhoto: item.userPhoto || '',
                    countLabel: Number(item.count).toLocaleString('en-US').replace(/,/g, ' '),
                }));
        },
    },

    methods: {
        // у старых записей tld может не прийти — тогда строка просто не кликается
        openProfile(row) {
            if (!row?.tld) return;
            this.$router.push('/view/' + row.tld);
        },

        getInitial(name) {
            if (!name || typeof name !== 'string') return 'U';
            const clean = cleanString(name).trim();
            return (clean[0] || name.trim()[0] || 'U').toUpperCase();
        },

        hidePhoto(row) {
            if (row.rawPhoto && !this.brokenPhotos.includes(row.rawPhoto)) {
                this.brokenPhotos.push(row.rawPhoto);
            }
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
