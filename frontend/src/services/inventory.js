import api from "./api";

export const fetchAdminInventory = () => api.get("/admin/inventory");
