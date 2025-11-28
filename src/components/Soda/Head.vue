<template>
  <div class="_direction _comp _item _user" :class="Key">
    <div v-if="isLoading" class="_skeleton">
      <div class="_image"></div>
    </div>

    <div v-else class="_content">
      <div class="_profileTickets soda">
        <img :src="Image_Ticket" alt="button" />
        <p>{{ storeCache.UserSodaEvent.tickets || 0 }}</p>
      </div>

      <div class="center">
        <img :src="HeadImage" alt="head" />
      </div>

      <div class="ctx">
        <h4>Infiniti QX50</h4>

        <span
          v-if="!timerFinished"
          class="timer"
        >
          {{ $t('soda.head.timer', { timer: timerText }) }}
        </span>

        <span
          v-else
          class="timer finished"
        >
          {{ $t('soda.head.giveawayCancel') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Image_Ticket from '@/assets/images/soda-ticket.svg';
import HeadImage from '@/assets/images/soda/head.png';

const START_TS = 1764354554;           // от этого момента
const WEEK_SEC = 7 * 24 * 60 * 60;    // неделя

export default {
  data() {
    return {
      storeCache: useCacheStore(),

      Image_Ticket,
      HeadImage,

      timerText: '',
      timerFinished: false,
      _timerId: null,
    };
  },

  mounted() {
    this.startTimer();
  },

  beforeUnmount() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  },

  methods: {
    startTimer() {
      const startMs = START_TS * 1000;
      const endMs = startMs + WEEK_SEC * 1000;

      const update = () => {
        const now = Date.now();
        let diffMs = endMs - now;

        if (diffMs <= 0) {
          this.timerText = '00d 00h 00m 00s';
          this.timerFinished = true;
          if (this._timerId) {
            clearInterval(this._timerId);
            this._timerId = null;
          }
          return;
        }

        const totalSec = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSec / (24 * 3600));
        const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

        this.timerText = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(
          seconds
        )}s`;
      };

      // сразу посчитать, чтобы не ждать 1 секунду
      update();

      if (this._timerId) {
        clearInterval(this._timerId);
      }
      this._timerId = setInterval(update, 1000);
    },
  },
};
</script>

<style lang="sass" scoped>
@use "@/assets/styles/soda/_comp.sass"

.ctx
  display: flex
  flex-direction: column
  gap: 4px

  h4
    font-weight: 600

  .timer
    display: inline-flex
    align-items: center
    gap: 4px
    font-weight: 500
    font-size: 13px
    letter-spacing: .03em
    opacity: .9
    text-transform: none
    animation: timerGlow 2s ease-in-out infinite alternate

  .timer.finished
    opacity: .7
    animation: none

@keyframes timerGlow
  from
    text-shadow: 0 0 4px rgba(255, 255, 255, .2)
  to
    text-shadow: 0 0 12px rgba(255, 255, 255, .45)
    transform: translateY(-0.5px)
</style>