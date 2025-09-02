import { localization } from "./getLocalization";

const useLocalization = () => {
    const getLocalization = () => {
        return localization;
    }

    return { getLocalization }
}

export { useLocalization }