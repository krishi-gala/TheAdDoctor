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

export const updateBookingStatus = async (bookingId, data) => {
  return await api.patch(`/bookings/admin/${bookingId}/status`, data);
};

export const fetchPendingBookingsCount = async () => {
  return await api.get("/bookings/admin/pending-count");
};

