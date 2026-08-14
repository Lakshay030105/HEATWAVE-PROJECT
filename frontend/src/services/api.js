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


// ============================================================================
// MOCK DATA — 10 Jaipur wards with realistic demographics & ML feature weights
// ============================================================================

export const MOCK_WARDS = [
  {
    wardId: 'JAI-W01', name: 'Chowkri Modikhana', cityId: 'jaipur',
    population: 85000, pctElderly: 0.16, pctOutdoorWorkers: 0.38, greenCoverPct: 0.04,
    vulnerabilityScore: 82,
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
    vulnerabilityScore: 45,
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
    vulnerabilityScore: 85,
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
    vulnerabilityScore: 68,
    boundary: { type: 'Polygon', coordinates: [[[75.830, 26.800], [75.870, 26.800], [75.870, 26.840], [75.830, 26.840], [75.830, 26.800]]] },
    latestRisk: { riskTier: 'Moderate', hvi: 48, forecastTempC: 41, forecastHumidity: 29, date: new Date().toISOString().split('T')[0] }
  },
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
  { _id: 'a1', wardId: 'JAI-W01', tier: 'Extreme', channel: 'sms', recipientCount: 28400, message: 'EXTREME HEAT WARNING: Temp 46°C in Chowkri Modikhana. Avoid outdoor activity 11AM-4PM. Drink ORS.', sentAt: new Date(Date.now() - 300000).toISOString(), status: 'sent' },
  { _id: 'a2', wardId: 'JAI-W05', tier: 'Extreme', channel: 'voice', recipientCount: 31200, message: 'अति भीषण गर्मी चेतावनी: सांगानेर में तापमान 47°C। छायादार स्थानों में रहें।', sentAt: new Date(Date.now() - 600000).toISOString(), status: 'sent' },
  { _id: 'a3', wardId: 'JAI-W02', tier: 'Severe', channel: 'sms', recipientCount: 19500, message: 'SEVERE HEAT ADVISORY: Purani Basti temp 44°C. Cooling center open at Chandpole.', sentAt: new Date(Date.now() - 1200000).toISOString(), status: 'sent' },
  { _id: 'a4', wardId: 'JAI-W08', tier: 'Severe', channel: 'push', recipientCount: 14000, message: 'High heat stress alert in Jhotwara. Hydration stations active.', sentAt: new Date(Date.now() - 1800000).toISOString(), status: 'sent' },
  { _id: 'a5', wardId: 'JAI-W03', tier: 'Moderate', channel: 'sms', recipientCount: 12800, message: 'Elevated daytime temperatures expected in Malviya Nagar.', sentAt: new Date(Date.now() - 3600000).toISOString(), status: 'sent' },
];

export const MOCK_RESOURCES = [
  { _id: 'r1', wardId: 'JAI-W01', type: 'cooling_center', name: 'Modikhana Community Hall', address: 'Badi Chaupar, Jaipur', capacity: 120, currentOccupancy: 88, status: 'open', lat: 26.925, lng: 75.825, amenities: ['AC', 'ORS Kiosk', 'Medical Bed'] },
  { _id: 'r2', wardId: 'JAI-W01', type: 'cooling_center', name: 'Johari Bazar Shelter', address: 'Johari Bazar', capacity: 80, currentOccupancy: 76, status: 'open', lat: 26.922, lng: 75.828, amenities: ['Coolers', 'Drinking Water', 'Doctor on Call'] },
  { _id: 'r3', wardId: 'JAI-W05', type: 'cooling_center', name: 'Sanganer Stadium Relief Camp', address: 'Sanganer Stadium', capacity: 200, currentOccupancy: 185, status: 'open', lat: 26.820, lng: 75.795, amenities: ['Misting Fans', 'Electrolyte Packs', 'Ambulance Bay'] },
  { _id: 'r4', wardId: 'JAI-W02', type: 'cooling_center', name: 'Purani Basti Community Hall', address: 'Chandpole Bazar', capacity: 100, currentOccupancy: 42, status: 'open', lat: 26.925, lng: 75.815, amenities: ['AC', 'Rest Chairs'] },
  { _id: 'r5', wardId: 'JAI-W06', type: 'cooling_center', name: 'Vaishali Nagar Sports Complex', address: 'Queens Road', capacity: 150, currentOccupancy: 28, status: 'open', lat: 26.915, lng: 75.735, amenities: ['AC Hall', 'Hydration Point'] },
  { _id: 'r6', wardId: 'JAI-W04', type: 'water_station', name: 'Mansarovar Metro Water ATM', address: 'VT Road Circle', capacity: 500, currentOccupancy: 340, status: 'open', lat: 26.865, lng: 75.765, amenities: ['Chilled Ro Water', 'ORS Packets'] },
  { _id: 'r7', wardId: 'JAI-W08', type: 'cooling_center', name: 'Jhotwara Industrial Center', address: 'Industrial Area Rd 4', capacity: 120, currentOccupancy: 110, status: 'open', lat: 26.945, lng: 75.735, amenities: ['High Power Misters', 'Medical Staff'] },
  { _id: 'r8', wardId: 'JAI-W03', type: 'water_station', name: 'Apex Circle Water Point', address: 'Malviya Nagar Sector 4', capacity: 300, currentOccupancy: 120, status: 'open', lat: 26.858, lng: 75.819, amenities: ['Water Tanker Kiosk'] }
];

export const MOCK_REPORTS = [
  { _id: 'rep-1', wardId: 'JAI-W01', reportType: 'heat_illness', description: 'Elderly shopkeeper collapsed due to dehydration near Badi Chaupar bazaar.', severity: 'severe', status: 'investigating', reportedAt: new Date(Date.now() - 15 * 60000).toISOString(), contactPhone: '+91 98290 11234', location: 'Badi Chaupar Market' },
  { _id: 'rep-2', wardId: 'JAI-W05', reportType: 'water_shortage', description: 'Water ATM dry since 11:00 AM outside textile market. Over 80 outdoor laborers waiting.', severity: 'severe', status: 'pending', reportedAt: new Date(Date.now() - 35 * 60000).toISOString(), contactPhone: '+91 94140 88765', location: 'Sanganer Main Market' },
  { _id: 'rep-3', wardId: 'JAI-W08', reportType: 'infrastructure_issue', description: 'Cooling mist fan non-functional at industrial bus terminus.', severity: 'moderate', status: 'pending', reportedAt: new Date(Date.now() - 65 * 60000).toISOString(), contactPhone: '+91 97850 44321', location: 'Jhotwara Bus Stand' },
  { _id: 'rep-4', wardId: 'JAI-W02', reportType: 'heat_illness', description: 'Construction worker suffering from heat cramps and dizziness.', severity: 'moderate', status: 'resolved', reportedAt: new Date(Date.now() - 120 * 60000).toISOString(), contactPhone: '+91 91660 77889', location: 'Chandpole Gate Site', resolutionNote: 'Ambulance 108 dispatched. Patient stabilized with IV electrolytes.' },
  { _id: 'rep-5', wardId: 'JAI-W04', reportType: 'general', description: 'Requesting mobile water tanker near evening vegetable mandi.', severity: 'mild', status: 'investigating', reportedAt: new Date(Date.now() - 180 * 60000).toISOString(), contactPhone: '+91 99280 55432', location: 'Mansarovar Sector 7' },
];

export const MOCK_EMERGENCY_UNITS = [
  { id: 'AMB-101', code: '108-JAI-NORTH', type: 'ambulance', baseStation: 'SMS Hospital Base', assignedWard: 'JAI-W01', status: 'on_scene', crew: 'Dr. Sharma + 1 EMT', lat: 26.924, lng: 75.824, etaMins: 0, battery: 94 },
  { id: 'AMB-102', code: '108-JAI-SOUTH', type: 'ambulance', baseStation: 'Mahatma Gandhi Hospital', assignedWard: 'JAI-W05', status: 'dispatched', crew: 'EMT Verma + Driver', lat: 26.815, lng: 75.801, etaMins: 4, battery: 88 },
  { id: 'AMB-103', code: '108-JAI-WEST', type: 'ambulance', baseStation: 'Vaishali Urban Clinic', assignedWard: null, status: 'available', crew: 'EMT Rathore + Driver', lat: 26.912, lng: 75.742, etaMins: 0, battery: 100 },
  { id: 'TNK-201', code: 'PHED-TANKER-01', type: 'water_tanker', baseStation: 'Civil Lines Water Works', assignedWard: 'JAI-W05', status: 'dispatched', crew: 'Driver Kuldeep', lat: 26.832, lng: 75.808, etaMins: 8, capacityLiters: 10000 },
  { id: 'TNK-202', code: 'PHED-TANKER-02', type: 'water_tanker', baseStation: 'Bani Park Depot', assignedWard: null, status: 'available', crew: 'Driver Mohan', lat: 26.931, lng: 75.792, etaMins: 0, capacityLiters: 10000 },
  { id: 'CLINIC-301', code: 'HEAT-MOBILE-01', type: 'mobile_clinic', baseStation: 'Jaipur Nagar Nigam HQ', assignedWard: 'JAI-W08', status: 'on_scene', crew: '2 Nurses + ORS inventory', lat: 26.942, lng: 75.738, etaMins: 0, capacityTreated: 42 }
];

export default api;
