import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const init = async (initData: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/init`,
      {},
      { headers: { Authorization: initData } }
    );
    if (response.status === 200) {
      Cookies.set("token", initData);
      return response.data;
    } else if (response.status === 403) {
      window.location.reload();
      return false;
    }
    return false;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      window.location.reload();
    }
    return false;
  } 
};