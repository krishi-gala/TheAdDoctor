import api from "./api";

export const fetchSmartTimingRecommendation = async (formatSlug) => {
  return await api.get(`/smart-timing/recommendations/${formatSlug}`);
};

// Admin API for Smart Timing
export const fetchAdminTimingsByBusiness = (businessType) => 
    api.get(`/smart-timing/admin/business/${businessType}`);

export const fetchAdminTimings = (formatSlug, businessType) => 
    api.get(`/smart-timing/admin/${formatSlug}/${businessType}`);

export const createAdminTiming = (formatSlug, businessType, data) => 
    api.post(`/smart-timing/admin/${formatSlug}/${businessType}`, data);

export const updateAdminTiming = (recommendationId, data) => 
    api.put(`/smart-timing/admin/${recommendationId}`, data);

export const toggleAdminTiming = (recommendationId, is_active) => 
    api.patch(`/smart-timing/admin/${recommendationId}/status`, { is_active });

export const deleteAdminTiming = (recommendationId) => 
    api.delete(`/smart-timing/admin/${recommendationId}`);
