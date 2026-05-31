import { forwardCommunityToSheets } from './forwardCommunityToSheets.js';
import { verifyAdminLogin, verifyAdminToken } from './communityAdminAuth.js';
import { handleLocalCommunityRequest } from './communityStore.js';

const ADMIN_ACTIONS = new Set([
  'listPending',
  'listAllArticles',
  'listAllCourses',
  'createArticle',
  'updateArticle',
  'approveArticle',
  'rejectArticle',
  'deleteArticle',
  'createCourse',
  'updateCourse',
  'deleteCourse',
]);

const ADMIN_WRITE_ACTIONS = new Set([
  'createArticle',
  'updateArticle',
  'approveArticle',
  'rejectArticle',
  'deleteArticle',
  'createCourse',
  'updateCourse',
  'deleteCourse',
]);

function getCommunitySheetsUrl(env = process.env) {
  return env.GOOGLE_COMMUNITY_SHEETS_URL || env.VITE_GOOGLE_COMMUNITY_SHEETS_URL || '';
}

function useLocalFallback(action, result) {
  if (!result?.ok || result.data?.success === false) return true;
  if (action === 'adminLogin' && !result.data?.adminToken) return true;

  if (ADMIN_WRITE_ACTIONS.has(action)) {
    return !(
      result.data?.message ||
      result.data?.article ||
      result.data?.course ||
      result.data?.id
    );
  }

  if (action === 'listAllArticles' || action === 'listPending') {
    return !Array.isArray(result.data?.articles);
  }

  if (action === 'listAllCourses') {
    return !Array.isArray(result.data?.courses);
  }

  if (Array.isArray(result.data?.articles || result.data?.courses)) return false;
  if (result.data?.article || result.data?.course) return false;
  return true;
}

export async function handleCommunityRequest({
  method = 'GET',
  action,
  query = {},
  body = null,
  adminToken = '',
  env = process.env,
} = {}) {
  if (action === 'adminLogin' && method === 'POST') {
    return verifyAdminLogin(body?.password);
  }

  if (ADMIN_ACTIONS.has(action) && !verifyAdminToken(adminToken)) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const sheetsUrl = getCommunitySheetsUrl(env);
  if (sheetsUrl) {
    const result = await forwardCommunityToSheets(sheetsUrl, {
      method,
      action,
      query,
      body,
      adminToken,
    });

    if (result.ok && !useLocalFallback(action, result)) {
      return { ok: true, data: result.data };
    }
  }

  const local = handleLocalCommunityRequest(action, { query, body: body || {} });
  if (local.success === false) {
    return { ok: false, status: 400, error: local.error };
  }
  return { ok: true, data: local };
}
