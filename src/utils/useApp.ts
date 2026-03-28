import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { pluralize as pluralizeRu } from "numeralize-ru";

import * as inflection from "inflection";

import 'dayjs/locale/en';

dayjs.extend(relativeTime);
 
const getUserLanguage = (): 'ru' | 'en' | 'zh' | 'ar' => {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ar')) return 'ar';
  return 'en';
};

const unixToDefault = (unix: number) => {
  const date = new Date(unix * 1000);
  const formattedDate = date
    .toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '.');

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${formattedDate} at ${formattedTime}`;
};

const unixToRelative = (unix: number) => {
  dayjs.locale('ru');
  return dayjs.unix(unix / 1000).fromNow();
};

const randomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 10 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

const cleanString = (str: string) => {
  if (!str) return '';
  // Allow Latin, Cyrillic, Arabic, CJK and digits
  return str.replace(/[^a-zA-Zа-яА-ЯёЁ\u0600-\u06ff\u4e00-\u9fff\u3400-\u4dbf0-9\s]/g, '');
}

export const getImageUrl = (nftKey: string) => {
  if (!nftKey) return '';
  const nftKeyCleaned = nftKey.replace('nft_', 'gift_');
  const bucketsLink = import.meta.env.VITE_APP_S3_LINK;
  return `${bucketsLink}/gifts/png/${nftKeyCleaned}.png`;
};

export const getImageUrlSvg = (nftKey: string) => {
  if (!nftKey) return '';
  const nftKeyCleaned = nftKey;
  const bucketsLink = import.meta.env.VITE_APP_S3_LINK;
  return `${bucketsLink}/gifts/${nftKeyCleaned}.svg`;
};

export const obfuscateAddress = (address: string) => {
    const startLength = 3;
    const endLength = 5;
    const str = address.slice(0, startLength) + "..." + address.slice(-endLength);
    if (str.length <= startLength + endLength) return str;
    return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
};

export const splitCamelCase = (name: string) => {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
};

const isCyrillicStr = (s: string) => /[а-яёА-ЯЁ]/.test(s);
const isNonLatinStr = (s: string) => /[\u0600-\u06ff\u4e00-\u9fff\u3400-\u4dbf]/.test(s);

export const pluralizeReferrals = (word: string, count: number, lang: string = 'en') => {
    const isRu = (lang && lang.toLowerCase().startsWith('ru')) || isCyrillicStr(word);
    if (isRu) return pluralizeRu(count, "реферал", "реферала", "рефералов");
    if (isNonLatinStr(word)) return word;
    return inflection.inflect(word, count);
};

export const getImg = (name: string) => {
    const bucketsLink = import.meta.env.VITE_APP_S3_LINK;
    return `${bucketsLink}/public/${name}`;
};

export { getUserLanguage, unixToDefault, unixToRelative, randomString, cleanString };