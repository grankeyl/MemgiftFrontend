import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export interface DealGift {
  uuid: string;
  nft_unique_key: string;
  image: string;
  symbol?: string;
  rarity: string;
  upgraded: boolean;
  bg_center?: string;
  bg_around?: string;
}

export interface PrivateDeal {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_photo: string;
  gifts: DealGift[];
  gift_count: number;
  price_stars: number;
  price_nano: number;
  status: "pending" | "accepted" | "cancelled" | "expired";
  buyer_id: string | null;
  buyer_name: string | null;
  created_at: number;
  updated_at: number;
}

function authHeaders() {
  const token = Cookies.get("token");
  return { Authorization: `${token}` };
}

export const create = async (
  _sellerId: string,
  _sellerName: string,
  gifts: DealGift[],
  priceNano: number
): Promise<PrivateDeal | false> => {
  try {
    const response = await axios.post(
      `${API_URL}/private-deal/create`,
      {
        gifts: gifts.map((g) => ({
          uuid: g.uuid,
          nft_unique_key: g.nft_unique_key,
          image: g.image || '',
          symbol: g.symbol || '',
          rarity: g.rarity || '',
          upgraded: g.upgraded || false,
          bg_center: g.bg_center || '',
          bg_around: g.bg_around || '',
        })),
        price_nano: priceNano,
      },
      { headers: authHeaders() }
    );
    return response.data;
  } catch {
    return false;
  }
};

export const getAll = async (_sellerId: string): Promise<PrivateDeal[]> => {
  try {
    const response = await axios.get(`${API_URL}/private-deal/list`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch {
    return [];
  }
};

export const getById = async (dealId: string): Promise<PrivateDeal | false> => {
  try {
    const response = await axios.get(`${API_URL}/private-deal/${dealId}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch {
    return false;
  }
};

export const cancel = async (dealId: string): Promise<boolean> => {
  try {
    await axios.post(
      `${API_URL}/private-deal/${dealId}/cancel`,
      {},
      { headers: authHeaders() }
    );
    return true;
  } catch {
    return false;
  }
};

export const accept = async (
  dealId: string,
  _buyerId: string,
  _buyerName: string
): Promise<{ status: string } | false> => {
  try {
    const response = await axios.post(
      `${API_URL}/private-deal/${dealId}/accept`,
      {},
      { headers: authHeaders() }
    );
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 402) {
      return { status: 'insufficient_funds' };
    }
    return false;
  }
};

export const getDealShareUrl = (dealId: string): string => {
  const miniAppLink = import.meta.env.VITE_APP_MINI_APP_LINK;
  return `${miniAppLink}=deal_${dealId}`;
};

export function nanoToTon(nano: number): string {
  if (!nano) return '0';
  const ton = nano / 1_000_000_000;
  return ton % 1 === 0 ? ton.toString() : ton.toFixed(2);
}

export function tonToNano(ton: number): number {
  return Math.round(ton * 1_000_000_000);
}
