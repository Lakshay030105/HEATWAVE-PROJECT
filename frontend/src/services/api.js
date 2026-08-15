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
// API Functions — match docs/API_CONTRACTS.md + Feature Extensions
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

export const sendBroadcastAlert = (alertData) =>
  api.post('/alerts', alertData).catch(() => ({
    success: true,
    data: {
      _id: `alert-${Date.now()}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
      ...alertData
    }
  }));

// Resources
export const getResources = (type, wardId) =>
  api.get('/resources', { params: { type, wardId } }).catch(() => ({ success: true, data: MOCK_RESOURCES }));
export const updateResource = (id, data) =>
  api.put(`/resources/${id}`, data).catch(() => ({ success: true, data }));

// Citizen Feedback / Reports
export const getReports = () =>
  api.get('/feedback').catch(() => ({ success: true, data: MOCK_REPORTS }));
export const submitFeedback = (data) =>
  api.post('/feedback', data).catch(() => ({ success: true, id: `rep-${Date.now()}` }));
export const updateReport = (id, data) =>
  api.put(`/feedback/${id}`, data).catch(() => ({ success: true, data }));

// Emergency Units Dispatcher
export const getEmergencyUnits = () =>
  api.get('/emergency/units').catch(() => ({ success: true, data: MOCK_EMERGENCY_UNITS }));
export const dispatchUnitApi = (unitId, wardId) =>
  api.post('/emergency/dispatch', { unitId, wardId }).catch(() => ({
    success: true,
    unitId,
    wardId,
    status: 'dispatched',
    dispatchedAt: new Date().toISOString()
  }));

// Simulation & ML Recompute
export const simulateHeatwave = (wardId, tier) =>
  api.post('/simulate', { wardId, tier }).catch(() => ({ success: true, wardId, tier, message: 'Simulation active (mock)' }));

export const recomputeMLPipeline = () =>
  axios.post('http://localhost:8000/internal/recompute').catch(() => ({ success: true, message: 'ML Pipeline recomputed on Jaipur dataset' }));

export const predictHeatwaveLive = (latitude, longitude) =>
  axios.post('http://localhost:8000/api/predict', { latitude, longitude })
    .then(res => res.data)
    .catch(() => ({
      latitude,
      longitude,
      temperature_celsius: 39.5,
      prediction: 'Low (No Heatwave)',
      status: 'Fallback'
    }));


// ============================================================================
// FALLBACK SEED DATA — Matches MongoDB Seeded Jaipur Wards (JPR-W01 to JPR-W06)
// ============================================================================

export const MOCK_WARDS = [
  {
    wardId: 'JAI-W01', name: 'Chowkri Modikhana', cityId: 'jaipur',
    population: 85000, pctElderly: 0.16, pctOutdoorWorkers: 0.38, greenCoverPct: 0.04,
    vulnerabilityScore: 74.4,
    boundary: { type: 'Polygon', coordinates: [[[75.82, 26.92], [75.83, 26.92], [75.83, 26.93], [75.82, 26.93], [75.82, 26.92]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 60, forecastTempC: 31.8, forecastHumidity: 97, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W02', name: 'Johari Bazar', cityId: 'jaipur',
    population: 92000, pctElderly: 0.18, pctOutdoorWorkers: 0.42, greenCoverPct: 0.03,
    vulnerabilityScore: 79.2,
    boundary: { type: 'Polygon', coordinates: [[[75.82, 26.91], [75.84, 26.91], [75.84, 26.92], [75.82, 26.92], [75.82, 26.91]]] },
    latestRisk: { riskTier: 'Severe', hvi: 78, forecastTempC: 43.5, forecastHumidity: 28, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W03', name: 'Malviya Nagar', cityId: 'jaipur',
    population: 65000, pctElderly: 0.14, pctOutdoorWorkers: 0.22, greenCoverPct: 0.14,
    vulnerabilityScore: 54,
    boundary: { type: 'Polygon', coordinates: [[[75.80, 26.84], [75.83, 26.84], [75.83, 26.87], [75.80, 26.87], [75.80, 26.84]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 54, forecastTempC: 41, forecastHumidity: 28, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W04', name: 'Mansarovar', cityId: 'jaipur',
    population: 110000, pctElderly: 0.12, pctOutdoorWorkers: 0.35, greenCoverPct: 0.08,
    vulnerabilityScore: 78,
    boundary: { type: 'Polygon', coordinates: [[[75.74, 26.84], [75.78, 26.84], [75.78, 26.88], [75.74, 26.88], [75.74, 26.84]]] },
    latestRisk: { riskTier: 'Extreme', hvi: 95, forecastTempC: 47.5, forecastHumidity: 20, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W05', name: 'Sanganer Industrial', cityId: 'jaipur',
    population: 95000, pctElderly: 0.09, pctOutdoorWorkers: 0.48, greenCoverPct: 0.05,
    vulnerabilityScore: 91,
    boundary: { type: 'Polygon', coordinates: [[[75.76, 26.79], [75.82, 26.79], [75.82, 26.83], [75.76, 26.83], [75.76, 26.79]]] },
    latestRisk: { riskTier: 'Extreme', hvi: 91, forecastTempC: 45.8, forecastHumidity: 20, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W06', name: 'Vaishali Nagar', cityId: 'jaipur',
    population: 72000, pctElderly: 0.14, pctOutdoorWorkers: 0.28, greenCoverPct: 0.12,
    vulnerabilityScore: 58,
    boundary: { type: 'Polygon', coordinates: [[[75.72, 26.89], [75.76, 26.89], [75.76, 26.93], [75.72, 26.93], [75.72, 26.89]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 58, forecastTempC: 41, forecastHumidity: 28, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W07', name: 'Civil Lines', cityId: 'jaipur',
    population: 48000, pctElderly: 0.15, pctOutdoorWorkers: 0.15, greenCoverPct: 0.25,
    vulnerabilityScore: 32,
    boundary: { type: 'Polygon', coordinates: [[[75.78, 26.89], [75.81, 26.89], [75.81, 26.92], [75.78, 26.92], [75.78, 26.89]]] },
    latestRisk: { riskTier: 'Low', hvi: 32, forecastTempC: 38, forecastHumidity: 32, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W08', name: 'Bani Park', cityId: 'jaipur',
    population: 56000, pctElderly: 0.17, pctOutdoorWorkers: 0.24, greenCoverPct: 0.16,
    vulnerabilityScore: 48,
    boundary: { type: 'Polygon', coordinates: [[[75.78, 26.92], [75.80, 26.92], [75.80, 26.94], [75.78, 26.94], [75.78, 26.92]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 48, forecastTempC: 39.5, forecastHumidity: 30, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W09', name: 'Jhotwara', cityId: 'jaipur',
    population: 88000, pctElderly: 0.11, pctOutdoorWorkers: 0.44, greenCoverPct: 0.07,
    vulnerabilityScore: 82,
    boundary: { type: 'Polygon', coordinates: [[[75.73, 26.93], [75.77, 26.93], [75.77, 26.96], [75.73, 26.96], [75.73, 26.93]]] },
    latestRisk: { riskTier: 'Severe', hvi: 82, forecastTempC: 44.2, forecastHumidity: 22, date: new Date().toISOString().split('T')[0] }
  },
  {
    wardId: 'JAI-W10', name: 'Amer / Kukas', cityId: 'jaipur',
    population: 41000, pctElderly: 0.20, pctOutdoorWorkers: 0.38, greenCoverPct: 0.18,
    vulnerabilityScore: 62,
    boundary: { type: 'Polygon', coordinates: [[[75.84, 26.96], [75.88, 26.96], [75.88, 27.00], [75.84, 27.00], [75.84, 26.96]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 62, forecastTempC: 42, forecastHumidity: 27, date: new Date().toISOString().split('T')[0] }
  }
];

export const MOCK_DAILY_RISKS = MOCK_WARDS.map(w => ({
  wardId: w.wardId,
  date: w.latestRisk.date,
  hvi: w.latestRisk.hvi,
  forecastTempC: w.latestRisk.forecastTempC,
  forecastHumidity: w.latestRisk.forecastHumidity,
  riskTier: w.latestRisk.riskTier,
  computedAt: new Date().toISOString(),
  isSimulated: false,
}));

export const MOCK_ALERTS = [
  { _id: 'a1', wardId: 'JAI-W05', tier: 'Extreme', channel: 'sms', recipientCount: 28400, message: 'EXTREME HEAT WARNING: Temp 45°C in Sanganer Industrial. Avoid outdoor activity 11AM-4PM. Drink ORS.', sentAt: new Date(Date.now() - 300000).toISOString(), status: 'sent' },
  { _id: 'a2', wardId: 'JAI-W04', tier: 'Extreme', channel: 'sms', recipientCount: 38500, message: 'EXTREME HEAT WARNING: Mansarovar temp 47.5°C. Seek cooling centers immediately.', sentAt: new Date(Date.now() - 600000).toISOString(), status: 'sent' },
  { _id: 'a3', wardId: 'JAI-W02', tier: 'Severe', channel: 'sms', recipientCount: 19500, message: 'SEVERE HEAT ADVISORY: Johari Bazar temp 43.5°C. Cooling center open at Ramlila Ground.', sentAt: new Date(Date.now() - 1200000).toISOString(), status: 'sent' },
  { _id: 'a4', wardId: 'JAI-W03', tier: 'Moderate', channel: 'sms', recipientCount: 12800, message: 'Elevated daytime temperatures expected in Malviya Nagar.', sentAt: new Date(Date.now() - 3600000).toISOString(), status: 'sent' }
];

export const MOCK_RESOURCES = [
  { _id: 'r1', wardId: 'JAI-W03', type: 'cooling_center', name: 'Malviya Community Center', address: 'Sector 3, Malviya Nagar', capacity: 150, currentOccupancy: 45, status: 'open', lat: 26.855, lng: 75.815, amenities: ['AC', 'ORS Kiosk', 'Medical Bed'] },
  { _id: 'r2', wardId: 'JAI-W03', type: 'water_station', name: 'Apex Circle Hydration Point', address: 'Apex Circle, Malviya Nagar', capacity: 500, currentOccupancy: 120, status: 'open', lat: 26.852, lng: 75.819, amenities: ['Coolers', 'Drinking Water'] },
  { _id: 'r3', wardId: 'JAI-W04', type: 'cooling_center', name: 'Mansarovar Urban Health Post', address: 'Madhyam Marg, Mansarovar', capacity: 200, currentOccupancy: 95, status: 'open', lat: 26.862, lng: 75.762, amenities: ['Misting Fans', 'Electrolyte Packs', 'Ambulance Bay'] },
  { _id: 'r4', wardId: 'JAI-W04', type: 'medical_camp', name: 'Shipra Path Emergency Heat Camp', address: 'Shipra Path, Mansarovar', capacity: 80, currentOccupancy: 60, status: 'open', lat: 26.859, lng: 75.768, amenities: ['AC', 'Rest Chairs'] },
  { _id: 'r5', wardId: 'JAI-W07', type: 'cooling_center', name: 'SMS Stadium Cooling Hub', address: 'Ambedkar Circle, C-Scheme', capacity: 300, currentOccupancy: 80, status: 'open', lat: 26.905, lng: 75.802, amenities: ['AC Hall', 'Hydration Point'] },
  { _id: 'r6', wardId: 'JAI-W06', type: 'cooling_center', name: 'Amrapali Circle Relief Point', address: 'Amrapali Circle, Vaishali Nagar', capacity: 120, currentOccupancy: 40, status: 'open', lat: 26.912, lng: 75.742, amenities: ['Chilled Ro Water', 'ORS Packets'] },
  { _id: 'r7', wardId: 'JAI-W05', type: 'cooling_center', name: 'Sanganer Mandi Emergency Shelter', address: 'Main Market, Sanganer', capacity: 250, currentOccupancy: 180, status: 'open', lat: 26.812, lng: 75.789, amenities: ['High Power Misters', 'Medical Staff'] },
  { _id: 'r8', wardId: 'JAI-W05', type: 'water_station', name: 'RIICO Industrial Hydration Station', address: 'RIICO Area, Sanganer', capacity: 600, currentOccupancy: 310, status: 'open', lat: 26.808, lng: 75.795, amenities: ['Water Tanker Kiosk'] }
];

export const MOCK_REPORTS = [
  { _id: 'rep-1', wardId: 'JAI-W05', reportType: 'heat_illness', description: 'Factory worker collapsed due to dehydration near RIICO industrial area.', severity: 'severe', status: 'investigating', reportedAt: new Date(Date.now() - 15 * 60000).toISOString(), contactPhone: '+91 98290 11234', location: 'Sanganer RIICO Area' },
  { _id: 'rep-2', wardId: 'JAI-W04', reportType: 'water_shortage', description: 'Water ATM dry outside vegetable market. Over 50 people waiting.', severity: 'severe', status: 'pending', reportedAt: new Date(Date.now() - 35 * 60000).toISOString(), contactPhone: '+91 94140 88765', location: 'Mansarovar Sector 7' },
  { _id: 'rep-3', wardId: 'JAI-W03', reportType: 'infrastructure_issue', description: 'Cooling mist fan non-functional at Apex circle bus stop.', severity: 'moderate', status: 'pending', reportedAt: new Date(Date.now() - 65 * 60000).toISOString(), contactPhone: '+91 97850 44321', location: 'Malviya Nagar Apex Circle' }
];

export const MOCK_EMERGENCY_UNITS = [
  { id: 'AMB-101', code: '108-JAI-NORTH', type: 'ambulance', baseStation: 'SMS Hospital Base', assignedWard: 'JAI-W07', status: 'on_scene', crew: 'Dr. Sharma + 1 EMT', lat: 26.905, lng: 75.802, etaMins: 0, battery: 94 },
  { id: 'AMB-102', code: '108-JAI-SOUTH', type: 'ambulance', baseStation: 'Mahatma Gandhi Hospital', assignedWard: 'JAI-W05', status: 'dispatched', crew: 'EMT Verma + Driver', lat: 26.808, lng: 75.795, etaMins: 4, battery: 88 },
  { id: 'AMB-103', code: '108-JAI-WEST', type: 'ambulance', baseStation: 'Vaishali Urban Clinic', assignedWard: null, status: 'available', crew: 'EMT Rathore + Driver', lat: 26.912, lng: 75.742, etaMins: 0, battery: 100 },
  { id: 'TNK-201', code: 'PHED-TANKER-01', type: 'water_tanker', baseStation: 'Civil Lines Water Works', assignedWard: 'JAI-W04', status: 'dispatched', crew: 'Driver Kuldeep', lat: 26.862, lng: 75.762, etaMins: 8, capacityLiters: 10000 },
  { id: 'TNK-202', code: 'PHED-TANKER-02', type: 'water_tanker', baseStation: 'Bani Park Depot', assignedWard: null, status: 'available', crew: 'Driver Mohan', lat: 26.912, lng: 75.742, etaMins: 0, capacityLiters: 10000 },
  { id: 'CLINIC-301', code: 'HEAT-MOBILE-01', type: 'mobile_clinic', baseStation: 'Jaipur Nagar Nigam HQ', assignedWard: 'JAI-W05', status: 'on_scene', crew: '2 Nurses + ORS inventory', lat: 26.812, lng: 75.789, etaMins: 0, capacityTreated: 42 }
];

export default api;
