import api from "./api";

export const createBooking = async (data) => {
  return await api.post("/bookings/", data);
};

export const fetchMyBookings = async () => {
  return await api.get("/bookings/my-bookings");
};

export const fetchAllBookings = async () => {
  return await api.get("/bookings/admin/all");
};

export const fetchApprovedBookings = async () => {
  return await api.get("/bookings/admin/approved");
};

export const updateBookingStatus = async (bookingId, data) => {
  return await api.patch(`/bookings/admin/${bookingId}/status`, data);
};

export const manageBooking = async (bookingId, data) => {
  return await api.patch(`/bookings/admin/${bookingId}/manage`, data);
};

export const submitBrandQuery = async (bookingId, brandQuery) => {
  return await api.patch(`/bookings/${bookingId}/query`, { brand_query: brandQuery });
};

export const fetchBrandQuery = async (bookingId) => {
  return await api.get(`/bookings/${bookingId}/query`);
};

export const resolveBrandQuery = async (bookingId) => {
  return await api.patch(`/bookings/admin/${bookingId}/query/resolve`);
};

export const fetchPendingBookingsCount = async () => {
  return await api.get("/bookings/admin/pending-count");
};
