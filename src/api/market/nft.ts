import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_MARKET_URL;

export const create = async (
  id_nft: string,
  id_balance_owner: string,
  price_ton: number,
  auc: boolean = false,
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/create`,
      {
        id_nft: id_nft,
        id_balance_owner: id_balance_owner,
        price_ton: price_ton,
        auc: auc,
      },
      {
        headers: {
          "X-Init-Data": tokenBearer || "",
        },
      }
    );

    return response.data;
  } catch (error) {
    return false;
  }
};

export const minPrice = async (
  UKey: string,
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.get(
      `${API_URL}/gift/min?G=${UKey}`,
      {
        headers: {
          "X-Init-Data": tokenBearer || "",
        },
      }
    );
    const count = response.data;
    return count;
  } catch (error) {
    return false;
  }
};

export const modelsName = async (
    UKey: string,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/name/${UKey}`,
            {
              headers: {
                "X-Init-Data": tokenBearer || "",
              },
            }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};