import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const getAll = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/nft/last`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const history = response.data;
        return history;
    } catch (error) {
        return false;
    }
};