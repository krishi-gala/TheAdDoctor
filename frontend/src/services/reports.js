import API from "./api";

/**
 * Fetches the entire reports payload in a single request.
 * Returns all 10 analytics sections from GET /admin/reports.
 */
export async function fetchReports() {
  const response = await API.get("/admin/reports");
  return response.data;
}
