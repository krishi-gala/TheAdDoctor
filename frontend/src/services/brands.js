import API from "./api";

export const fetchBrands = (params = {}) => {
  return API.get("/admin/brands", { params });
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
