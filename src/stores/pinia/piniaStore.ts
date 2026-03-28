import { defineStore } from 'pinia';

type Gift = any;

export const useCacheStore = defineStore('cache', {
  state: () => ({
    LoadedData: [],
    TelegramData: {},
    UserData: {},
    UserNFTs: {} as Record<string, { items: Gift[]; count: number; fullyLoaded: boolean }>,
    UserSodaEvent: {},
    NftsApp: {},
    NftsAppData: {},
    RatingApp: [],
    TasksApp: {},
    HistoryApp: [],
    Upgrades: {
      Backgrounds: []
    },

    Market: {
      Basket: {
        Items: [],
        Count: 0,
        FullyLoaded: false,
      },
    },

    LastMulticheckSummary: [] as Array<{ name: string; image: string; count: number }>,
  }),
});