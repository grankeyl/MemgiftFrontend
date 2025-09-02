import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const createTokenStars = async (
    userId: string,
    NftUniqueKey: string,
    nftPriceCurrent: number,
    NftBuyCount: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/token/create/stars`,
            { user_id: userId, nftUniqueKey: NftUniqueKey, nftPrice: nftPriceCurrent, nftCount: NftBuyCount },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const token = response.data;
        return token;
    } catch (error) {
        return false;
    }
};
