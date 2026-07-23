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

// CAMPAIGN QUERY endpoints
export const submitBrandQuery = (bookingId, subject, message) => {
  return api.post(`/brand/campaign-queries/${bookingId}`, { subject, message });
};

export const fetchQueriesForBooking = (bookingId) => {
  return api.get(`/brand/campaign-queries/${bookingId}`);
};

export const adminFetchQueriesForBooking = (bookingId) => {
  return api.get(`/admin/campaign-queries/${bookingId}`);
};

export const adminReplyToQuery = (queryId, admin_reply, status = "resolved") => {
  return api.patch(`/admin/campaign-queries/${queryId}/reply`, { admin_reply, status });
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
