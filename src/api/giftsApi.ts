import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const get = async (
    id: number,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/gifts/${id}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};

export const getAll = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/gifts`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        return false;
    }
};