import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_MARKET_URL;

export const lots = async (
  gift_ukey: string,
  symbol: string,
  backdrop: string,
  sort: string,
  offset: number,
  limit: number
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.get(
      `${API_URL}/lots?gift_ukey=${gift_ukey}` +
      `&symbol=${symbol}` +
      `&background=${backdrop}` +
      `&sort=${sort}` +
      `&page=${offset}&limit=${limit}`,
      { headers: { "X-Init-Data": tokenBearer || "", } }
    );
    return response.data;
  } catch (error) {
    return false;
  }
};

export const buy = async (
  id: string = '',
  ids: string[] = []
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/byu`,
      { id, ids },
      { headers: { "X-Init-Data": tokenBearer || "", } }
    );
    return response.data;
  } catch (error: any) {
    if (!error.response) return false;
    return error.response.data;
  }
};

export const remove = async (
  id: string,
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.delete(
      `${API_URL}/lots/${id}`,
      { headers: { "X-Init-Data": tokenBearer || "", } }
    );
    return response.data;
  } catch (error: any) {
    if (!error.response) return false;
    return error.response.data;
  }
};

export const symbols = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/symbols`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const backdrops = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/backgrounds`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const listings = async (
  gift_ukey: any,
  symbol: any,
  backdrop: any,
  sort: string,
  offset: number,
  limit: number
) => {
    try {
        let symbolJ = symbol.join(',');
        let backdropJ = backdrop.join(',');
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/listings` +
            `?gift_name=${gift_ukey}` +
            `&nft_symbol_name=${symbolJ}` +
            `&nftbg_name=${backdropJ}` +
            `&sort=${sort}` +
            `&page=${offset}&limit=${limit}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};