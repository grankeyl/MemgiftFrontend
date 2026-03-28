<template>
  <div class="pd-tabs _lefting">
    <button
      class="pd-tabs__btn"
      :class="{ active: Section === 'Create' }"
      @click="$emit('setSection', 'Create')"
    >
      {{ $t('privateDeal.tabCreate') }}
    </button>
    <button
      class="pd-tabs__btn"
      :class="{ active: Section === 'Deals' }"
      @click="$emit('setSection', 'Deals')"
    >
      {{ $t('privateDeal.tabDeals') }}
      <span v-if="dealsCount > 0" class="pd-tabs__count">{{ dealsCount }}</span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    Section: { type: String, required: true },
    dealsCount: { type: Number, default: 0 },
  },
  emits: ['setSection'],
};
</script>
