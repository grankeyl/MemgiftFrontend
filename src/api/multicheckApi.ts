import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const create = async (
    userId: string,
    nftUniqueKey: string,
    nftsIds: string[],
    nftsCount: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.post(
            `${API_URL}/multicheck/create`,
            { user_id: userId, nftUniqueKey: nftUniqueKey, nftsIds: nftsIds, nftsCount: nftsCount },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};

export const getUuid = async (uuid: string) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/multicheck/get/uuid`,
            { uuid },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};

export const activate = async (uuid: string) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/multicheck/activate`,
            { uuid },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};

export const cancel = async (uuid: string) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/multicheck/cancel`,
            { uuid },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};

export const confirmPayment = async (uuid: string) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/multicheck/confirm-payment`,
            { uuid },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};

export const createMulticheckInvoice = async (
    multicheckUuid: string,
    nftsCount: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/payments/create-multicheck`,
            { multicheck_uuid: multicheckUuid, nfts_count: nftsCount },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        return false;
    }
};
