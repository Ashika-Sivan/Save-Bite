import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export interface signupData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export const signupUser = async (data: signupData) => {
    const response = await api.post(API_ROUTES.AUTH.REGISTER, data);
    return response.data;
};

export const sendOtp = async (email: string) => {
    const response = await api.post(API_ROUTES.AUTH.SEND_OTP, { email });
    return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
    const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, {
        email,
        otp
    });
    return response.data;
};

export const resendOtp = async (email: string) => {
    const response = await api.post(API_ROUTES.AUTH.RESEND_OTP, {
        email
    });
    return response.data;
};

export const login = async (loginData: { email: string; password: string }) => {
    const response = await api.post(API_ROUTES.AUTH.LOGIN, loginData);
    return response.data;
};

export const logout = async () => {
    const response = await api.post(API_ROUTES.AUTH.LOGOUT);
    return response.data;
};

export const refreshAccessToken = async () => {
    const response = await api.post(API_ROUTES.AUTH.REFRESH);
    return response.data;
};

export const getMe = async () => {
    const response = await api.get(API_ROUTES.AUTH.ME);
    return response.data;
};

export const registerVendor = async (data: unknown) => {
    const response = await api.post(API_ROUTES.VENDOR.REGISTER, data);
    return response.data;
};

export const forgotPassword = async (email: string) => {
    const response = await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
};

export const resetPassword = async (data: {
    token: string;
    newPassword: string;
}) => {
    const response = await api.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
    return response.data;
};
