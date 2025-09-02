import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const create = async (
    wallet_address: string
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/wallet/create`,
      { wallet_address },
      { headers: { Authorization: `${tokenBearer}` } }
    );
    return response.data;
  } catch (error) {
    return false;
  }
};

export const disconnect = async () => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.get(
      `${API_URL}/wallet/disconnect`,
      { headers: { Authorization: `${tokenBearer}` } }
    );
    return response.data;
  } catch (error) {
    return false;
  }
};