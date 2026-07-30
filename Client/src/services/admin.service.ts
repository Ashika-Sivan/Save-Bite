import api from "./api";

type AdminLoginData = {
  email: string;
  password: string;
};

export const adminLogin = async (data: AdminLoginData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getAllVendors = async () => {
  const response = await api.get("/admin/vendors");
  return response.data;
};

export const getVendorById = async (vendorId: string) => {
  const response = await api.get(`/admin/vendors/${vendorId}`);
  return response.data;
};

export const approveVendor = async (vendorId: string) => {
  const response = await api.patch(
    `/admin/vendors/${vendorId}/approve`
  );

  return response.data;
};

export const rejectVendor = async (
  vendorId: string,
  reason: string
) => {
  const response = await api.patch(
    `/admin/vendors/${vendorId}/reject`,
    { reason }
  );

  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const toggleUserStatus = async (userId: string) => {
  const response = await api.patch(
    `/admin/users/${userId}/status`
  );

  return response.data;
};