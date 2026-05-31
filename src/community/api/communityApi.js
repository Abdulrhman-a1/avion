import { seedArticles, seedCourses } from '../data/seedData.js';
import { ADMIN_TOKEN_KEY } from '../constants.js';

const API_BASE = '/api/community';

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

async function request(action, { method = 'GET', query = {}, body = null, admin = false } = {}) {
  const adminToken = admin ? getAdminToken() : '';
  const params = new URLSearchParams({ action, ...query });
  if (adminToken) params.set('adminToken', adminToken);

  const url = `${API_BASE}?${params.toString()}`;

  const headers = { Accept: 'application/json' };
  if (adminToken) headers['X-Admin-Token'] = adminToken;

  const init = { method, headers };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify({
      action,
      ...body,
      ...(adminToken ? { adminToken } : {}),
    });
  }

  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  if (data.success === false) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function useSeedArticles(filters = {}) {
  let items = seedArticles.filter((a) => a.status === (filters.status || 'approved'));
  if (filters.category) items = items.filter((a) => a.category === filters.category);
  if (filters.q) {
    const needle = filters.q.toLowerCase();
    items = items.filter((a) =>
      `${a.title} ${a.summary} ${a.author} ${a.category}`.toLowerCase().includes(needle),
    );
  }
  return items;
}

function useSeedCourses(filters = {}) {
  let items = [...seedCourses];
  if (filters.category) items = items.filter((c) => c.category === filters.category);
  if (filters.q) {
    const needle = filters.q.toLowerCase();
    items = items.filter((c) =>
      `${c.title} ${c.summary} ${c.category}`.toLowerCase().includes(needle),
    );
  }
  return items.sort((a, b) => Number(a.order) - Number(b.order));
}

export async function fetchArticles(filters = {}) {
  try {
    const data = await request('listArticles', {
      query: { status: 'approved', category: filters.category || '', q: filters.q || '' },
    });
    return data.articles || [];
  } catch {
    return useSeedArticles(filters);
  }
}

export async function fetchArticle(id) {
  try {
    const data = await request('getArticle', { query: { id } });
    return data.article;
  } catch {
    return seedArticles.find((a) => a.id === id) || null;
  }
}

export async function fetchCourses(filters = {}) {
  try {
    const data = await request('listCourses', {
      query: { category: filters.category || '', q: filters.q || '' },
    });
    return data.courses || [];
  } catch {
    return useSeedCourses(filters);
  }
}

export async function fetchCourse(id) {
  try {
    const data = await request('getCourse', { query: { id } });
    return data.course;
  } catch {
    return seedCourses.find((c) => c.id === id) || null;
  }
}

export async function submitArticle(payload) {
  return request('submitArticle', { method: 'POST', body: payload });
}

export async function adminLogin(password) {
  const data = await request('adminLogin', { method: 'POST', body: { password } });
  if (!data.adminToken) {
    throw new Error('Login failed. No session token returned — check ADMIN_PASSWORD in .env.');
  }
  setAdminToken(data.adminToken);
  return data;
}

export async function fetchPendingArticles() {
  try {
    const data = await request('listPending', { admin: true });
    return data.articles || [];
  } catch (err) {
    if (!isAdminLoggedIn()) throw err;
    return seedArticles.filter((a) => a.status === 'pending');
  }
}

export async function fetchAllArticlesAdmin() {
  const data = await request('listAllArticles', { admin: true });
  return data.articles || [];
}

export async function approveArticle(id) {
  return request('approveArticle', { method: 'POST', body: { id }, admin: true });
}

export async function rejectArticle(id, rejectionReason) {
  return request('rejectArticle', { method: 'POST', body: { id, rejectionReason }, admin: true });
}

export async function deleteArticle(id) {
  return request('deleteArticle', { method: 'POST', body: { id }, admin: true });
}

export async function createArticleAdmin(payload) {
  return request('createArticle', { method: 'POST', body: payload, admin: true });
}

export async function updateArticleAdmin(payload) {
  return request('updateArticle', { method: 'POST', body: payload, admin: true });
}

export async function fetchAllCoursesAdmin() {
  const data = await request('listAllCourses', { admin: true });
  return data.courses || [];
}

export async function createCourseAdmin(payload) {
  return request('createCourse', { method: 'POST', body: payload, admin: true });
}

export async function updateCourseAdmin(payload) {
  return request('updateCourse', { method: 'POST', body: payload, admin: true });
}

export async function deleteCourseAdmin(id) {
  return request('deleteCourse', { method: 'POST', body: { id }, admin: true });
}

export function formatArticlePreview(content = '', max = 160) {
  const plain = String(content).replace(/\s+/g, ' ').trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

export function renderSimpleMarkdown(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
