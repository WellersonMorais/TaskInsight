// src/services/api.js
//
// Centraliza TODAS as chamadas HTTP para o backend.
// Reaproveita a lógica de apiHeaders() e authRequest() do frontend antigo,
// mas de forma mais organizada e reutilizável.

const BASE_URL = ''; // Vazio porque o Vite fará proxy para o backend (configurado no vite.config.js)
const TOKEN_KEY = 'taskinsight_token';

// --- Helpers internos ---

// Monta o cabeçalho com o token JWT (igual à função apiHeaders() do dashboard.js antigo)
const getHeaders = (includeContentType = false) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (includeContentType) headers['Content-Type'] = 'application/json';
  return headers;
};

// Função base para todas as requisições (similar ao fetchJson() do dashboard.js antigo)
const request = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, options);
  
  // Se a sessão expirou, força o logout redirecionando para o login
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return data;
};

// ============================================================
// AUTENTICAÇÃO
// ============================================================

export const authLogin = (email, password) =>
  request('/api/auth/login', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ email, password }),
  });

export const authRegister = (name, email, password) =>
  request('/api/auth/register', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () =>
  request('/api/auth/me', { headers: getHeaders() });

// ============================================================
// TAREFAS
// ============================================================

export const getTarefas = (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.categoria) query.set('categoria', filters.categoria);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/tasks${queryString}`, { headers: getHeaders() });
};

export const criarTarefa = (payload) =>
  request('/api/tasks', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

export const atualizarTarefa = (id, payload) =>
  request(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

export const deletarTarefa = (id) =>
  request(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

// ============================================================
// DADOS & ANALYTICS (reaproveitando as chamadas do dashboard.js)
// ============================================================

export const getSummary = () =>
  request('/api/data/summary', { headers: getHeaders() });

export const getAnalytics = () =>
  request('/api/data/analytics', { headers: getHeaders() });
