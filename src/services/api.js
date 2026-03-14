// src/services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Model 1: Color Recommendation ───────────────────────────────────────────
export const predictColor = (data) =>
  api.post('/model1', data).then(r => r.data);

// ─── Model 2: Manufacturer Color Prediction ───────────────────────────────────
export const predictManufacturerColor = (data) =>
  api.post('/model2', data).then(r => r.data);

// ─── Model 3: Quality Prediction ─────────────────────────────────────────────
export const predictQuality = (data) =>
  api.post('/model3', data).then(r => r.data);

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = (params) =>
  api.get('/products', { params }).then(r => r.data);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  api.get('/admin/stats').then(r => r.data);

export const getUsers = () =>
  api.get('/admin/users').then(r => r.data);

export const updateUserStatus = (uid, status) =>
  api.patch(`/admin/users/${uid}`, { status }).then(r => r.data);

export const getModelMetrics = () =>
  api.get('/admin/models').then(r => r.data);

// ─── Manufacturer ─────────────────────────────────────────────────────────────
export const getManufacturerStats = () =>
  api.get('/manufacturer/stats').then(r => r.data);

export const getPredictionHistory = () =>
  api.get('/predictions/history').then(r => r.data);

export default api;