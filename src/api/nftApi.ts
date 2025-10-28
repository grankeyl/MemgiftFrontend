import NftSlice from "../stores/nftSlice";
import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const getGift = async (
    uuid: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/user/gift/${uuid}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const createFree = async (
    userId: string,
    nftUniqueKey: string,
    nftKey: string,
    nftPrice: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/create/free`,
            { userId, nftUniqueKey, nftKey, nftPrice },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const checkFree = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/gift/free/check`,
            { },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getGifts = async (
    status: string,
    filter: string,
    gift_ukey: string,
    offset: number,
    limit: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.get(
            `${API_URL}/nft/m_u?status=${status}` +
            `&filter=${filter}` +
            `&gift_ukey=${gift_ukey}` +
            `&offset=${offset}&limit=${limit}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const nfts = response.data;
        return nfts;
    } catch (error) {
        return false;
    }
};

export const getUserGifts = async (
    userId: string,
    status: string,
    filter: string,
    gift_ukey: string,
    offset: number,
    limit: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.get(
            `${API_URL}/nft/m_u/${userId}?status=${status}` +
            `&filter=${filter}` +
            `&gift_ukey=${gift_ukey}` +
            `&offset=${offset}&limit=${limit}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const nfts = response.data;
        return nfts;
    } catch (error) {
        return false;
    }
};

export const getAllStacksUKey = async (UKey: string, offset: number, limit: number) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.get(
            `${API_URL}/users/stack/${UKey}?offset=${offset}&limit=${limit}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const nfts = response.data;
        return nfts;
    } catch (error) {
        return false;
    }
}

export const getAllStacksReceived = async (
    userId: string,
    offset: number,
    limit: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.post(
            `${API_URL}/nft/get/all/stacks/received`,
            { userId, offset, limit },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const nfts = response.data;
        return nfts;
    } catch (error) {
        return false;
    }
};

export const getAllStacksPurchased = async (
    userId: string,
    offset: number,
    limit: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.post(
            `${API_URL}/nft/get/all/stacks/purchased`,
            { userId, offset, limit },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        console.log(response.data)
        const nfts = response.data;
        return nfts;
    } catch (error) {
        return false;
    }
};

export const getAll = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        if (!tokenBearer) return false;
        const response = await axios.get(
            `${API_URL}/nft/get/all`,
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const nfts = response.data;
        const object = NftSlice().getAll(nfts.object);
        const proxy = nfts.proxy;
        return { object, proxy };
    } catch (error) {
        return false;
    }
};

export const getCountToName = async (
    nftUniqueKey: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/name/all`,
            { nftUniqueKey },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getNftsUser = async (
    userId: string,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/all/user`,
            { userId },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
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
            `${API_URL}/nft/get/uuid`,
            { uuid },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getLast = async (
    userId: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/last`,
            { userId },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const updateUuidToStatus = async (
    uuid: string,
    userId: string,
    status: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/update/uuid/status`,
            { uuid, userId, status },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const swap = async (
    UUIDs: any,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/user/swap`,
            { UUIDs },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const swapAll = async (
    UKey: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/user/swap/all`,
            { UKey },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getAllPurchased = async (
    userId: string,
    offset: number,
    limit: number,
    nftUniqueKey: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/all/purchased`,
            { userId, offset, limit, nftUniqueKey },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getPurchasedMulticheck = async (
    userId: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/purchased/multicheck`,
            { userId },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getAllUser = async (
    userId: string,
    offset: number,
    limit: number,
    nftUniqueKey?: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/all/gifts`,
            { userId, offset, limit, nftUniqueKey },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getAllReceived = async (
    userId: string, 
    offset: number, 
    limit: number,
    nftUniqueKey?: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/get/all/received`,
            { userId, offset, limit, nftUniqueKey },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const updateStatusSended = async (
    userId: string,
    id: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/update/status/sended`,
            { userId, id },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getRating = async (
    offset: number,
    limit: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/leader/hold?offset=${offset}&limit=${limit}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getTopContest = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/top-volume`,
            { headers: { "X-Init-Data": tokenBearer } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getTopRefs = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/leader/refs`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const upgrade = async (
    paymentUuid: string,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/${paymentUuid}/upgrade`,
            { },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const getNftUpgradeInfo = async (
    nftUniqueKey: string,
    modelName: string,
    modelSymbol: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/nft/upgrades/get/info`,
            { 
                NftUniqueKey: nftUniqueKey,
                ModelName: modelName, 
                ModelSymbol: modelSymbol
            },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const transfer = async (
    UUIDs: string[],
    ToTld: string
) => {
    console.log(UUIDs, ToTld);
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/user/transfer`,
            { uuids: UUIDs, to_tld: ToTld },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const count = response.data;
        return count;
    } catch (error) {
        return false;
    }
};

export const giftFree = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/gift/free`,
            { },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};

export const sodaLocked = async () => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/soda_locked`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};