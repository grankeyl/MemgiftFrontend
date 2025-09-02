import { defineStore } from 'pinia';

type Gift = any;

export const useCacheStore = defineStore('cache', {
  state: () => ({
    LoadedData: [],
    TelegramData: {},
    UserData: {},
    UserNFTs: {} as Record<string, { items: Gift[]; count: number; fullyLoaded: boolean }>,
    NftsApp: {},
    NftsAppData: {},
    RatingApp: [],
    TasksApp: {},
    HistoryApp: [],
    Upgrades: {
      Backgrounds: []
    }
  }),
});