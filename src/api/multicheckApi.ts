import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const create = async (
    userId: string,
    nftUniqueKey: string,
    nftsIds: string,
    nftsCount: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.post(
            `${API_URL}/multicheck/create`,
            { user_id: userId, nftUniqueKey: nftUniqueKey, nftsIds: nftsIds, nftsCount: nftsCount },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};

export const update = async (
    uuid: string,
    userIds: string,
    nftsIds: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/multicheck/update`,
            { uuid, userIds, nftsIds },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};

export const getUuid = async (
    uuid: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/multicheck/get/uuid`,
            { uuid },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};