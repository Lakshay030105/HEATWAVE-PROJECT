// ============================================================================
// api.js — Axios API Layer
// Owner: Member 3 (Frontend Lead)
// When to build: Day 1
// ============================================================================
//
// PURPOSE:
//   Centralized API client. All components call functions from this file
//   instead of making raw axios calls. Makes it easy to change the base URL
//   and add error handling in one place.
//
// WHAT TO BUILD:
//
//   1. Create an Axios instance with base URL from environment:
//      const api = axios.create({
//        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
//      });
//
//   2. API FUNCTIONS (one per endpoint):
//
//      // Wards
//      export const getWards = () => api.get('/wards');
//      export const getWardById = (wardId) => api.get(`/wards/${wardId}`);
//
//      // Risk
//      export const getRiskHistory = (wardId) => api.get(`/wards/${wardId}/risk`);
//      export const getLatestRisks = () => api.get('/risk/latest');
//
//      // Alerts
//      export const getAlerts = (wardId) =>
//        api.get('/alerts', { params: wardId ? { wardId } : {} });
//
//      // Resources
//      export const getResources = (type, wardId) =>
//        api.get('/resources', { params: { type, wardId } });
//      export const updateResource = (id, data) =>
//        api.put(`/resources/${id}`, data);
//
//      // Feedback
//      export const submitFeedback = (data) => api.post('/feedback', data);
//
//      // Simulation
//      export const simulateHeatwave = (wardId, tier) =>
//        api.post('/simulate', { wardId, tier });
//
//   3. OPTIONAL — Response interceptor for error handling:
//      api.interceptors.response.use(
//        (response) => response.data,  // unwrap the data field
//        (error) => { console.error('API Error:', error); throw error; }
//      );
//
// DEPENDENCIES:
//   - axios (already in package.json)
//   - VITE_API_BASE_URL from .env
//
// ============================================================================
