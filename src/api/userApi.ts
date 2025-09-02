import Cookies from "js-cookie";
import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const get = async (
    userId: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/user/get/${userId}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const get = response.data;
        return get;
    } catch (error) {
        return false;
    }
};

export const getReferrals = async (
    offset: number,
    limit: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/user/ref?offset=${offset}&limit=${limit}`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const get = response.data;
        return get;
    } catch (error) {
        return false;
    }
};

export const searchUser = async (
    query: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.get(
            `${API_URL}/user/search?q=${query}&limit=100`,
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const get = response.data;
        return get;
    } catch (error) {
        return false;
    }
};

export const getByUsername = async (
    username: string
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/user/get/by/username`,
            { username },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const get = response.data;
        return get;
    } catch (error) {
        return false;
    }
};