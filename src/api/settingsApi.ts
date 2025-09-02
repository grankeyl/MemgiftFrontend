import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const set = async (
    Language: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/settings/set`,
            { language: Language },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const get = response.data;
        return get;
    } catch (error) {
        return false;
    }
};