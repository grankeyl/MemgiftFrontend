import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const init = async (initData: string) => {
  let initDataRaw = initData as any;

  if (!initData) {
    initDataRaw = window?.Telegram?.WebApp?.initData;
  } else {
    initDataRaw = initData;
  }
 
  try {

    const response = await axios.post(
      `${API_URL}/users/init`,
      {},
      { headers: { Authorization: initDataRaw } }
    );
    if (response.status === 200) {
      Cookies.set("token", initDataRaw);
      return response.data;
    } else if (response.status === 403 || response.status === 405 ) {
      window.location.reload();
      return false;
    }
    return false;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 403 || error.response?.status === 405) {
      window.location.reload();
    }
    return false;
  } 
};