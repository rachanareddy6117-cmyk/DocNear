// ============================================
// Central API helper — talks to the Express backend.
// Change API_BASE if your backend runs elsewhere.
// ============================================
// Auto-detect backend URL: use current origin in production, localhost in dev
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api"
  : `${window.location.origin}/api`;

const Api = {
  token() {
    return localStorage.getItem("telemed_token");
  },

  setSession(token, user) {
    localStorage.setItem("telemed_token", token);
    localStorage.setItem("telemed_user", JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem("telemed_token");
    localStorage.removeItem("telemed_user");
  },

  currentUser() {
    const raw = localStorage.getItem("telemed_user");
    return raw ? JSON.parse(raw) : null;
  },

  // Generic request helper. `isForm` = true skips JSON.stringify for FormData uploads.
  async request(path, { method = "GET", body, isForm = false } = {}) {
    const headers = {};
    const token = this.token();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!isForm) headers["Content-Type"] = "application/json";

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message = (data && (data.message || data.errors?.[0]?.msg)) || "Something went wrong";
      throw new Error(message);
    }
    return data;
  },

  // ---- Auth ----
  register(payload) { return this.request("/auth/register", { method: "POST", body: payload }); },
  login(payload) { return this.request("/auth/login", { method: "POST", body: payload }); },
  me() { return this.request("/auth/me"); },

  // ---- Doctors ----
  listDoctors(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/doctors${qs ? `?${qs}` : ""}`);
  },
  nearestDoctors(lat, lng) { return this.request(`/doctors/nearest?lat=${lat}&lng=${lng}`); },
  getDoctor(id) { return this.request(`/doctors/${id}`); },
  updateDoctor(id, payload) { return this.request(`/doctors/${id}`, { method: "PUT", body: payload }); },

  // ---- Appointments ----
  bookAppointment(payload) { return this.request("/appointments", { method: "POST", body: payload }); },
  myAppointments() { return this.request("/appointments/mine"); },
  updateAppointmentStatus(id, payload) { return this.request(`/appointments/${id}/status`, { method: "PUT", body: payload }); },
  cancelAppointment(id) { return this.request(`/appointments/${id}/cancel`, { method: "PUT" }); },

  // ---- Prescriptions ----
  writePrescription(payload) { return this.request("/prescriptions", { method: "POST", body: payload }); },
  myPrescriptions() { return this.request("/prescriptions/mine"); },
  patientPrescriptions(patientId) { return this.request(`/prescriptions/patient/${patientId}`); },

  // ---- Orders (medications) ----
  placeOrder(payload) { return this.request("/orders", { method: "POST", body: payload }); },
  myOrders() { return this.request("/orders/mine"); },

  // ---- Lab tests ----
  bookLabTest(payload) { return this.request("/labtests", { method: "POST", body: payload }); },
  myLabTests() { return this.request("/labtests/mine"); },

  // ---- Reports ----
  uploadReport(formData) { return this.request("/reports", { method: "POST", body: formData, isForm: true }); },
  myReports() { return this.request("/reports/mine"); },
  sharedReports() { return this.request("/reports/shared"); },

  // ---- Video ----
  getVideoRoom(appointmentId) { return this.request(`/video/${appointmentId}`); },
};
