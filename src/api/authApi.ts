import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const init = async (initData: string) => {
  const start = performance.now(); // начало
  try {
    const response = await axios.post(
      `${API_URL}/users/init`,
      {},
      { headers: { Authorization: initData } }
    );
    const end = performance.now(); // конец
    console.log(`⏱️ Время запроса: ${(end - start).toFixed(2)}ms`);

    if (response.status === 200) {
      Cookies.set("token", initData);
      return response.data;
    }
    return false;
  } catch (error: any) {
    const end = performance.now(); // даже при ошибке фиксируем
    console.log(`⏱️ Время запроса (ошибка): ${(end - start).toFixed(2)}ms`);
    return false;
  }
};