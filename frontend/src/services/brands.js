import API from "./api";

export const fetchBrands = (params = {}) => {
  return API.get("/admin/brands", { params });
};

export const fetchBrandById = (id) => {
  return API.get(`/admin/brands/${id}`);
};

export const createBrand = (data) => {
  return API.post("/admin/brands", data);
};

export const updateBrand = (id, data) => {
  return API.put(`/admin/brands/${id}`, data);
};

export const deleteBrand = (id) => {
  return API.delete(`/admin/brands/${id}`);
};

export const updateBrandStatus = (id, is_active) => {
  return API.patch(`/admin/brands/${id}/status`, { is_active });
};

export const resetBrandPassword = (id, password) => {
  return API.put(`/admin/brands/${id}`, { password });
};

export const updateBrandCredits = (id, action, amount) => {
  return API.patch(`/admin/brands/${id}/credits`, { action, amount });
};
