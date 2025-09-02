import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const createPrepareMessageInvite = async (
    type: string,
    userId: string,
    link: string,
    language: string = 'ru'
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/telegram/prepare/message/invite`,
            { 
                type: type, 
                user_id: userId, 
                link: link,
                language: language, 
            },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const prepared = response.data;
        return prepared;
    } catch (error) {
        return false;
    }
};

export const createPrepareMessage = async (
    userId: string,
    nftUniqueKey: string,
    nftId: string,
    language: string = 'ru'
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/telegram/prepare/message`,
            { userId, nftUniqueKey, nftId, language },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const prepared = response.data;
        return prepared;
    } catch (error) {
        return false;
    }
};

export const createPrepareMulticheckMessage = async (
    userId: string,
    nftUniqueKey: string,
    nftId: string,
    nftUsed: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/telegram/prepare/multicheck/message`,
            { userId, nftUniqueKey, nftId, nftUsed },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const prepared = response.data;
        return prepared;
    } catch (error) {
        return false;
    }
};

export const updateShareMessage = async (
    nftUuid: string,
    checkType: string = 'check'
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/telegram/prepare/message/update`,
            { nftUuid, checkType },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const prepared = response.data;
        return prepared;
    } catch (error) {
        return false;
    }
};

export const updateShareMessageMulticheck = async (
    multicheckUserId: string,
    nftUuid: string,
    checkType: string = 'check'
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/telegram/prepare/message/updateMulticheck`,
            { multicheckUserId, nftUuid, checkType },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const prepared = response.data;
        return prepared;
    } catch (error) {
        return false;
    }
};

export const checkUserChannel = async (
    channelId: number,
    userId: string,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/telegram/check/user/channel`,
            { channelId, userId },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const data = response.data;
        return data;
    } catch (error) {
        return false;
    }
};

export const getIdByUsername = async (username: string) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/ub/get/user`,
      { username: username },
      { headers: { Authorization: `Bearer ${tokenBearer}` } }
    );
    const data = response.data;
    return data;
  } catch (error) {
    return false;
  }
}