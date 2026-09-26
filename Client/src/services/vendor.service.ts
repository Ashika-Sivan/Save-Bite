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

export const getVendorProfiles = async () => {
    const response = await api.get(API_ROUTES.VENDOR.PROFILE);
    return response.data;
};

export const getSubVendor = async (hotelId: string) => {
    const response = await api.get(API_ROUTES.VENDOR.GET_SUB_VENDOR(hotelId));
    return response.data;
};

export const createSubVendorCredentials = async (hotelId: string, data: any) => {
    const response = await api.post(API_ROUTES.VENDOR.CREATE_SUB_VENDOR_CREDENTIALS(hotelId), data);
    return response.data;
};

export const updateSubVendorPermissions = async (hotelId: string, data: any) => {
    const response = await api.put(API_ROUTES.VENDOR.UPDATE_SUB_VENDOR_PERMISSIONS(hotelId), data);
    return response.data;
};

export const updateSubVendorPassword = async (hotelId: string, data: any) => {
    const response = await api.put(API_ROUTES.VENDOR.UPDATE_SUB_VENDOR_PASSWORD(hotelId), data);
    return response.data;
};

