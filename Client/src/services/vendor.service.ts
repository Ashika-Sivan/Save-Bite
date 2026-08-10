import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export const registerVendor = async (formData: FormData) => {
    const response = await api.post(API_ROUTES.VENDOR.REGISTER, formData);
    return response.data;
};

export const checkVendorStatus = async () => {
    const response = await api.get(API_ROUTES.VENDOR.STATUS);
    return response.data;
};

export const reapplyVendor = async (formData: FormData) => {
    const response = await api.post(API_ROUTES.VENDOR.REAPPLY, formData);
    return response.data;
};
