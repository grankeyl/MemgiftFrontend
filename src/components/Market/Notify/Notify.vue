<template>
  <div 
    class="notify"
    :class="{ hide: !visible }"
  >
    <h4>{{ Title }}</h4>
    <button @click="openLink">
      <h4>{{ Button }}</h4>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3L11 8L6 13" stroke="#6691FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="line" :style="{ width: lineWidth-7 + '%' }"></div>
  </div>
</template>

<script>
import { watch } from 'vue';

export default {
  props: {
    Title: {
      type: String,
      required: true,
    },
    Button: {
      type: String,
      required: true,
    },
    ButtonLink: {
      type: String,
      required: true,
    },
    Visible: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      visible: this.Visible,
      lineWidth: 100
    };
  },
  mounted() {
    watch(() => this.Visible, (newValue) => {
      if (!newValue) return;
      this.visible = newValue;
      const duration = 5000;
      const step = 100 / (duration / 100);
      const timer = setInterval(() => {
        this.lineWidth -= step;
        if (this.lineWidth <= 0) {
          this.lineWidth = 0;
          clearInterval(timer);
          this.visible = false;
          this.$emit('unVisible');
        }
      }, 100);
    });
  },
  methods: {
    openLink() {
      const link = this.ButtonLink;
      this.$router.push(link);
    }
  }
};
</script>

<style lang="sass">
@use "./Notify.sass"
</style>