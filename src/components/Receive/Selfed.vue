<template>
  <div class="_direction _comp _item _purchased">
    <div v-if="isLoading" class="_skeleton">
      <div class="rcv-sticker _shine"></div>
      <div class="rcv-head">
        <div class="rcv-head__title _shine"></div>
      </div>
    </div>

    <div v-else class="_content">
      <!-- у стикера свой салют, поэтому он без плитки — иначе эффект обрезается -->
      <div class="rcv-sticker">
        <Lottie class="lt" slug="duck-self" :loop="true" width="150" height="150" />
      </div>

      <div class="rcv-head">
        <h4>{{ Text }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
import Lottie from '../Lottie.vue';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    Background: { type: String, required: false, default: '' },
    NftKey: { type: String, required: false, default: '' },
    NftMedia: { type: String, required: false, default: '' },
    NftImage: { type: String, required: false, default: '' },
    Text: { type: String, required: true },
  },

  components: { Lottie },

  emits: ['loadSuccess'],

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
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
