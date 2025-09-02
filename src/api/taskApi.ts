import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const getAll = async () => {
    const tokenBearer = Cookies.get("token");
    const response = await axios.get(
        `${API_URL}/task`,
        { headers: { Authorization: `${tokenBearer}` } }
    );
    return response.data;
}

export const use = async (
    TaskId: string,
) => {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
        `${API_URL}/task/use`,
        { task_id: TaskId },
        { headers: { Authorization: `${tokenBearer}` } }
    );
    return response.data;
}

export const claim = async (
    TaskId: string,
) => {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
        `${API_URL}/task/claim`,
        { task_id: TaskId },
        { headers: { Authorization: `${tokenBearer}` } }
    );
    return response.data;
}