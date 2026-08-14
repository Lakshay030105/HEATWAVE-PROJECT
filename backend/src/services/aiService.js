// ============================================================================
// aiService.js — HTTP client for the FastAPI ai-service
// ============================================================================

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 120000);

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: AI_SERVICE_TIMEOUT_MS,
});

exports.recomputeRisk = async () => {
  const { data } = await aiClient.post('/internal/recompute');
  return data;
};

exports.predict = async (latitude, longitude) => {
  const { data } = await aiClient.post('/api/predict', { latitude, longitude });
  return data;
};

exports.health = async () => {
  const { data } = await aiClient.get('/health');
  return data;
};
