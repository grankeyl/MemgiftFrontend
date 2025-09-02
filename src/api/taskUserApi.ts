import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const create = async (
    userId: string,
    taskId: number,
    progress: any
) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/task/user/create`,
      {
        user_id: userId,
        task_id: taskId,
        progress: progress
      },
      {
        headers: {
          Authorization: `Bearer ${tokenBearer}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return false;
  }
};