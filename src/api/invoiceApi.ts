import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const createInvoiceNft = async (
    UKey: string,
    Count: number,
    Tickets: number = 0,
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/payments/create-link`,
            { UKey, Count, Tickets },
            { headers: { Authorization: `${tokenBearer}` } }
        );
        const invoiceLinkNft = response.data;
        return invoiceLinkNft;
    } catch (error) {
        return false;
    }
};

export const createInvoiceNftTransfer = async (
    UUID: string,
    UKey: string,
    TID: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/payments/create-transfer`,
            { UUID, UKey, TID },
            { headers: { Authorization: `${tokenBearer}` } }
        );  
        const invoiceLinkNft = response.data;
        return invoiceLinkNft;
    } catch (error) {
        return false;
    }
};

export const createInvoiceNftUpgrade = async (UUID: string) => {
  try {
    const tokenBearer = Cookies.get("token");
    const response = await axios.post(
      `${API_URL}/payments/upgrade`,
      { UUID },
      { headers: { Authorization: `${tokenBearer}` } }
    );
    return { success: true, ...response.data };
  } catch (error: any) {
    return { success: false, ...error };
  }
};

export const createInvoiceNftToken = async (
    userId: string,
    nftName: string,
    nftPrice: string,
    nftUniqueKey: string,
    nftCount: string,
    token: any,
    isUseTickets: boolean,
    ticketsCount: number
) => {
    try {
        const tokenBearer = Cookies.get("token");
        const response = await axios.post(
            `${API_URL}/invoice/nft/create/tickets`,
            { userId, nftName, nftPrice, nftUniqueKey, nftCount, token, isUseTickets, ticketsCount },
            { headers: { Authorization: `Bearer ${tokenBearer}` } }
        );
        const invoiceLinkNft = response.data;
        return invoiceLinkNft;
    } catch (error) {
        return false;
    }
};