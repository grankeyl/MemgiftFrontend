import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_MARKET_URL;

export const get = async (
    UserUUID: string,
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.get(
      `${API_URL}/balance`,
      {
        headers: {
          "X-Init-Data": tokenBearer || "",
          "X-User-UUID": UserUUID || "",
        },
      }
    );

    return response.data;
  } catch (error) {
    return false;
  }
};

export const deposit = async (
  min_amount_nano: number
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/deposit/init`,
      {
        min_amount_nano: min_amount_nano,
        ttl_seconds: 0
      },
      {
        headers: {
          "X-Init-Data": tokenBearer || ""
        },
      }
    );
    return response.data;
  } catch (error) {
    return false;
  }
};

export const withdraw = async (
  amount_ton: string, 
  amount_nano: string
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/withdraw/init`,
      {
        amount_ton,
        amount_nano,
      },
      {
        headers: {
          "X-Init-Data": tokenBearer || ""
        },
      }
    );
    return response.data;
  } catch (error) {
    return false;
  }
};
