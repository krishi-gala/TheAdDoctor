import api from "./api";

// Admin API
export const fetchAdminAdFormats = (params) => api.get("/admin/ad-formats", { params });
export const updateAdFormat = (formatId, data) => api.put(`/admin/ad-formats/${formatId}`, data);
export const updateAdFormatStatus = (formatId, is_active) => api.patch(`/admin/ad-formats/${formatId}/status`, { is_active });

// Brand API
export const fetchBrandAdFormats = () => api.get("/brand/ad-formats");
