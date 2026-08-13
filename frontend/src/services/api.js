import axios from 'axios';

// ---- Axios Instance ----
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Unwrap { success, data } envelope automatically
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// ============================================================================
// API Functions — match docs/API_CONTRACTS.md exactly
// ============================================================================

// Wards
export const getWards = () => api.get('/wards').catch(() => ({ success: true, data: MOCK_WARDS }));
export const getWardById = (wardId) => api.get(`/wards/${wardId}`).catch(() => {
  const w = MOCK_WARDS.find(w => w.wardId === wardId);
  return { success: true, data: w || null };
});

// Risk
export const getRiskHistory = (wardId) => api.get(`/wards/${wardId}/risk`).catch(() => ({ success: true, data: [] }));
export const getLatestRisks = () => api.get('/risk/latest').catch(() => ({ success: true, data: MOCK_DAILY_RISKS }));

// Alerts
export const getAlerts = (wardId) =>
  api.get('/alerts', { params: wardId ? { wardId } : {} }).catch(() => ({ success: true, data: MOCK_ALERTS }));

// Resources
export const getResources = (type, wardId) =>
  api.get('/resources', { params: { type, wardId } }).catch(() => ({ success: true, data: MOCK_RESOURCES }));
export const updateResource = (id, data) =>
  api.put(`/resources/${id}`, data).catch(() => ({ success: true, data }));

// Feedback
export const submitFeedback = (data) =>
  api.post('/feedback', data).catch(() => ({ success: true, id: 'mock-feedback-id' }));

// Simulation (THE demo button)
export const simulateHeatwave = (wardId, tier) =>
  api.post('/simulate', { wardId, tier }).catch(() => ({ success: true, wardId, tier, message: 'Simulation active (mock)' }));


// ============================================================================
// MOCK DATA — 10 Jaipur wards with realistic demographics
// Allows frontend to work independently of backend
// ============================================================================

const MOCK_WARDS = [
  {
    wardId: 'JAI-W01', name: 'Chowkri Modikhana', cityId: 'jaipur',
    population: 85000, pctElderly: 0.16, pctOutdoorWorkers: 0.38, greenCoverPct: 0.04,
    vulnerabilityScore: 82, // High density, old construction, high elderly
    boundary: { type: 'Polygon', coordinates: [[[75.820, 26.920], [75.830, 26.920], [75.830, 26.930], [75.820, 26.930], [75.820, 26.920]]] },
    latestRisk: { riskTier: 'Extreme', hvi: 88, forecastTempC: 46, forecastHumidity: 22, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W02', name: 'Purani Basti', cityId: 'jaipur',
    population: 72000, pctElderly: 0.14, pctOutdoorWorkers: 0.35, greenCoverPct: 0.05,
    vulnerabilityScore: 78,
    boundary: { type: 'Polygon', coordinates: [[[75.810, 26.920], [75.820, 26.920], [75.820, 26.930], [75.810, 26.930], [75.810, 26.920]]] },
    latestRisk: { riskTier: 'Severe', hvi: 76, forecastTempC: 44, forecastHumidity: 25, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W03', name: 'Malviya Nagar', cityId: 'jaipur',
    population: 68000, pctElderly: 0.10, pctOutdoorWorkers: 0.15, greenCoverPct: 0.25,
    vulnerabilityScore: 45, // More affluent, better green cover
    boundary: { type: 'Polygon', coordinates: [[[75.810, 26.850], [75.830, 26.850], [75.830, 26.870], [75.810, 26.870], [75.810, 26.850]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 51, forecastTempC: 42, forecastHumidity: 28, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W04', name: 'Mansarovar', cityId: 'jaipur',
    population: 120000, pctElderly: 0.11, pctOutdoorWorkers: 0.25, greenCoverPct: 0.18,
    vulnerabilityScore: 60,
    boundary: { type: 'Polygon', coordinates: [[[75.750, 26.850], [75.780, 26.850], [75.780, 26.880], [75.750, 26.880], [75.750, 26.850]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 55, forecastTempC: 41, forecastHumidity: 30, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W05', name: 'Sanganer', cityId: 'jaipur',
    population: 95000, pctElderly: 0.08, pctOutdoorWorkers: 0.42, greenCoverPct: 0.08,
    vulnerabilityScore: 85, // High industrial/outdoor worker concentration
    boundary: { type: 'Polygon', coordinates: [[[75.780, 26.810], [75.810, 26.810], [75.810, 26.830], [75.780, 26.830], [75.780, 26.810]]] },
    latestRisk: { riskTier: 'Extreme', hvi: 85, forecastTempC: 47, forecastHumidity: 20, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W06', name: 'Vaishali Nagar', cityId: 'jaipur',
    population: 45000, pctElderly: 0.16, pctOutdoorWorkers: 0.08, greenCoverPct: 0.28,
    vulnerabilityScore: 35,
    boundary: { type: 'Polygon', coordinates: [[[75.720, 26.900], [75.750, 26.900], [75.750, 26.930], [75.720, 26.930], [75.720, 26.900]]] },
    latestRisk: { riskTier: 'Low', hvi: 28, forecastTempC: 38, forecastHumidity: 35, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W07', name: 'Civil Lines', cityId: 'jaipur',
    population: 38000, pctElderly: 0.12, pctOutdoorWorkers: 0.10, greenCoverPct: 0.35,
    vulnerabilityScore: 30,
    boundary: { type: 'Polygon', coordinates: [[[75.780, 26.900], [75.800, 26.900], [75.800, 26.920], [75.780, 26.920], [75.780, 26.900]]] },
    latestRisk: { riskTier: 'Low', hvi: 22, forecastTempC: 37, forecastHumidity: 38, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W08', name: 'Jhotwara', cityId: 'jaipur',
    population: 88000, pctElderly: 0.09, pctOutdoorWorkers: 0.40, greenCoverPct: 0.06,
    vulnerabilityScore: 75,
    boundary: { type: 'Polygon', coordinates: [[[75.720, 26.930], [75.750, 26.930], [75.750, 26.960], [75.720, 26.960], [75.720, 26.930]]] },
    latestRisk: { riskTier: 'Severe', hvi: 78, forecastTempC: 45, forecastHumidity: 23, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W09', name: 'Vidyadhar Nagar', cityId: 'jaipur',
    population: 52000, pctElderly: 0.13, pctOutdoorWorkers: 0.15, greenCoverPct: 0.20,
    vulnerabilityScore: 48,
    boundary: { type: 'Polygon', coordinates: [[[75.760, 26.950], [75.790, 26.950], [75.790, 26.980], [75.760, 26.980], [75.760, 26.950]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 45, forecastTempC: 40, forecastHumidity: 32, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W10', name: 'Jagatpura', cityId: 'jaipur',
    population: 75000, pctElderly: 0.07, pctOutdoorWorkers: 0.32, greenCoverPct: 0.12,
    vulnerabilityScore: 68, // Growing suburb, lots of construction
    boundary: { type: 'Polygon', coordinates: [[[75.830, 26.800], [75.870, 26.800], [75.870, 26.840], [75.830, 26.840], [75.830, 26.800]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 48, forecastTempC: 41, forecastHumidity: 29, date: new Date().toISOString().split('T')[0] }
  },
];

const MOCK_DAILY_RISKS = MOCK_WARDS.map(w => ({
  wardId: w.wardId,
  date: w.latestRisk.date,
  hvi: w.latestRisk.hvi,
  forecastTempC: w.latestRisk.forecastTempC,
  forecastHumidity: w.latestRisk.forecastHumidity,
  riskTier: w.latestRisk.riskTier,
  computedAt: new Date().toISOString(),
  isSimulated: false,
}));

const MOCK_ALERTS = [
  { _id: 'a1', wardId: 'JAI-W01', tier: 'Extreme', channel: 'sms', recipientPhone: '+91****7890', sentAt: new Date(Date.now() - 300000).toISOString(), status: 'sent' },
  { _id: 'a2', wardId: 'JAI-W05', tier: 'Extreme', channel: 'sms', recipientPhone: '+91****4321', sentAt: new Date(Date.now() - 600000).toISOString(), status: 'sent' },
  { _id: 'a3', wardId: 'JAI-W02', tier: 'Severe', channel: 'sms', recipientPhone: '+91****5678', sentAt: new Date(Date.now() - 1200000).toISOString(), status: 'sent' },
  { _id: 'a4', wardId: 'JAI-W08', tier: 'Severe', channel: 'push', recipientPhone: 'N/A', sentAt: new Date(Date.now() - 1800000).toISOString(), status: 'sent' },
  { _id: 'a5', wardId: 'JAI-W03', tier: 'Severe', channel: 'sms', recipientPhone: '+91****9012', sentAt: new Date(Date.now() - 3600000).toISOString(), status: 'sent' },
];

const MOCK_RESOURCES = [
  { _id: 'r1', wardId: 'JAI-W01', type: 'cooling_center', name: 'Modikhana Community Hall', address: 'Badi Chaupar, Jaipur', capacity: 120, currentOccupancy: 45, status: 'open', lat: 26.925, lng: 75.825 },
  { _id: 'r2', wardId: 'JAI-W01', type: 'cooling_center', name: 'Johari Bazar Shelter', address: 'Johari Bazar', capacity: 80, currentOccupancy: 72, status: 'open', lat: 26.922, lng: 75.828 },
  { _id: 'r3', wardId: 'JAI-W05', type: 'cooling_center', name: 'Sanganer Relief Camp', address: 'Sanganer Stadium', capacity: 200, currentOccupancy: 180, status: 'open', lat: 26.820, lng: 75.795 },
  { _id: 'r4', wardId: 'JAI-W02', type: 'cooling_center', name: 'Purani Basti Masjid Hall', address: 'Chandpole Bazar', capacity: 100, currentOccupancy: 30, status: 'open', lat: 26.925, lng: 75.815 },
  { _id: 'r5', wardId: 'JAI-W06', type: 'cooling_center', name: 'Vaishali Sports Complex', address: 'Queen Road', capacity: 150, currentOccupancy: 10, status: 'open', lat: 26.915, lng: 75.735 },
  { _id: 'r6', wardId: 'JAI-W04', type: 'water_station', name: 'Mansarovar Water Kiosk', address: 'VT Road', capacity: 500, currentOccupancy: 120, status: 'open', lat: 26.865, lng: 75.765 },
  { _id: 'r7', wardId: 'JAI-W08', type: 'cooling_center', name: 'Jhotwara Industrial Shelter', address: 'Jhotwara Area', capacity: 100, currentOccupancy: 95, status: 'open', lat: 26.945, lng: 75.735 },
];

export default api;
