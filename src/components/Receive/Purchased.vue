<template>
  <div class="_direction _comp _item _purchased">
    <div v-if="isLoading" class="_skeleton">
      <div class="rcv-gift _shine"></div>
      <div class="rcv-head">
        <div class="rcv-head__title _shine"></div>
      </div>
    </div>

    <div v-else class="_content">
      <!-- плитка как в профиле: узор overlay + модель по центру, без ленты и подписей -->
      <div class="rcv-gift" :class="normalizedRarity">
        <div class="_symbols">
          <img :src="Image_giftBg" alt="" />
        </div>
        <div class="_nft">
          <GiftLottie
            v-if="NftMedia === 'lottie'"
            class="lt"
            :path="`/gifts/lottie/${NftKey}.json`"
            :loop="true"
            width="25"
            height="25"
            renderer="svg"
          />
          <img v-else :src="NftImage" alt="" />
        </div>
      </div>

      <div class="rcv-head">
        <h4>{{ Text }}</h4>
      </div>
    </div>
  </div>
</template>
<script>
import GiftLottie from '../GiftLottie.vue';
import Image_giftBg from '@/assets/gifts/png/gift_bg.png';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    Background: { type: String, required: false, default: '' },
    NftKey: { type: String, required: true },
    NftMedia: { type: String, required: true },
    NftImage: { type: String, required: true },
    NftRarity: { type: String, required: false, default: '' },
    Text: { type: String, required: true },
  },

  components: { GiftLottie },

  emits: ['loadSuccess'],

  data() {
    return { Image_giftBg };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    // редкость приходит в разном написании, классы фона — .legend / .veryrare
    normalizedRarity() {
      let rarity = String(this.NftRarity || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (rarity === 'legendary') rarity = 'legend';
      if (rarity === 'veryrarity') rarity = 'veryrare';
      return rarity;
    },
  },

  methods: {
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
