import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const getAll = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.get(
            `${API_URL}/history-ticket/get/all`,
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};