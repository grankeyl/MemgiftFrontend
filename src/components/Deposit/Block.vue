<template>
  <div :class="['_direction _comp _item _block', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_blocker"></div>
    </div>
    <div v-else class="_content">
      <div class="_blocker">
        <div class="_blockerLabel">
          <h4>{{ Label }}</h4>
          <div class="_blockerLabelBalance">
            <p>{{ $t('deposit.available') }}</p>
            <img src="/profile/ton.svg" alt="ton" />
            <span>{{ balanceTon.toFixed(2) }}</span>
          </div>
        </div>
        <div class="_blockerInput">
          <input
            type="text"
            placeholder="0.00"
            v-model="amountDeposit"
            inputmode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            @input="onInput"
          />
          <img src="/profile/ton-lig.svg" alt="ton" />
        </div>
        <div class="_blockerButton">
          <button @click="handleDeposit">
            <h4>{{ ButtonText }}</h4>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { useTonAddress } from '@townsquarelabs/ui-vue';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    },
    Label: {
      type: String,
      default: "",
    },
    ButtonText: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      storeCache: useCacheStore(),

      amountDeposit: 0,
      balanceTon: null,

      isLoading: this.$props.Skeleton,
    };
  },

  mounted() {
    this.loadResources();
    this.fetchBalance();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImage()]);
        this.$emit("loadSuccess");
      } catch {}
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImage() {
      if (!this.ImageShow || !this.Image) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = this.Image;
        img.onload = resolve;
        img.onerror = reject;
      });
    },

    onInput(event) {
      const value = event.target.value.replace(',', '.');
      if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
        this.amountDeposit = value;
      }
    },

    async fetchBalance() {
      // try {
      //   const raw = useTonAddress();
      //   const address = typeof raw === 'string' ? raw : raw.value;

      //   const url = `https://toncenter.com/api/v3/walletInformation?address=${address}&use_v2=true`;

      //   const res = await fetch(url, {
      //     method: 'GET',
      //     headers: {
      //       accept: 'application/json',
      //     },
      //   });

      //   const data = await res.json();

      //   if (!data.balance) {
      //     throw new Error(`${JSON.stringify(data)}`);
      //   }

      //   const balanceNano = BigInt(data.balance);
      //   this.balanceTon = (Number(balanceNano) / 1e9);
      // } catch (e) {
      //   this.balanceTon = '0.00';
      // }
    },

    async createTransaction() {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
            amount: "20000000"
          },
          {
            address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",
            amount: "60000000"
          }
        ]
      }
    },

    handleDeposit() {
      try {
        const amount = parseFloat(this.amountDeposit);
        if (isNaN(amount) || amount <= 0) {
          this.$toast.error('Введите сумму больше 0', { position: 'top-right' });
          return;
        }

        if (amount > this.balanceTon) {
          this.$toast.error('Недостаточно средств', { position: 'top-right' });
          return;
        }

        this.createTransaction();
      } catch (error) {
        console.log(error);
        this.$toast.error('Ошибка', { position: 'top-right' });
      }
    },
  },
};
</script>