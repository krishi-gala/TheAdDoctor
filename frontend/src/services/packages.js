import API from "./api";

// ADMIN Endpoints
export const fetchAdminPackages = (params = {}) => {
  return API.get("/admin/packages", { params });
};

export const fetchPackageOptions = (params = {}) => {
  return API.get("/admin/packages", {
    params: {
      status: "active",
      page_size: 100,
      ...params,
    },
  });
};

export const createPackage = (data) => {
  return API.post("/admin/packages", data);
};

export const updatePackage = (id, data) => {
  return API.put(`/admin/packages/${id}`, data);
};

export const updatePackageStatus = (id, is_active) => {
  return API.patch(`/admin/packages/${id}/status`, { is_active });
};

// BRAND Endpoints
export const fetchBrandPackages = () => {
  return API.get("/brand/packages");
};

export const purchasePackage = (packageId) => {
  return API.post(`/brand/purchase-package/${packageId}`);
};

export const fetchBrandWallet = () => {
  return API.get("/brand/wallet");
};

export const fetchBrandTransactions = (params = {}) => {
  return API.get("/brand/transactions", { params });
};
