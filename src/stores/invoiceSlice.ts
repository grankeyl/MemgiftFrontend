import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface InvoiceState {
    invoiceLinkNft: any | null;
}

const initialState: InvoiceState = {
    invoiceLinkNft: null,
};

const invoiceSlice = createSlice({
    name: "nft",
    initialState,
    reducers: {
        createInvoiceNftSuccess: (state, action: PayloadAction<{ invoiceLinkNft: Record<string, any> }>) => {
            state.invoiceLinkNft = action.payload.invoiceLinkNft;
            return state;
        },
        createInvoiceNftError: (state) => {
            return state;
        }
    },
});

export const { createInvoiceNftSuccess, createInvoiceNftError } = invoiceSlice.actions;
export const invoiceReducer = invoiceSlice.reducer;