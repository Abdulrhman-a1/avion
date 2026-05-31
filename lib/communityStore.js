import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', '.data', 'community-store.json');

const defaultArticles = [
  {
    id: 'seed-1',
    title: 'Building a RACI Matrix for STEM Racing Teams',
    author: 'AVION PM Team',
    category: 'Team Management',
    content:
      'A RACI matrix clarifies who is Responsible, Accountable, Consulted, and Informed for each deliverable.\n\nStart by listing your major work packages: engineering design, enterprise portfolio, pit display, and competition logistics.',
    status: 'approved',
    submittedAt: '2026-01-15T10:00:00.000Z',
    publishedAt: '2026-01-16T09:00:00.000Z',
    rejectionReason: '',
    summary: 'How to define clear roles and responsibilities across engineering, enterprise, and competition deliverables.',
  },
  {
    id: 'seed-2',
    title: 'Risk Logs That Actually Get Used',
    author: 'Majd Aljiawy',
    category: 'Risk Management',
    content: 'Most teams create a risk log once and never update it. Make yours actionable by scoring impact and probability.',
    status: 'approved',
    submittedAt: '2026-02-01T14:00:00.000Z',
    publishedAt: '2026-02-02T08:00:00.000Z',
    rejectionReason: '',
    summary: 'Turn passive risk lists into living documents with owners, triggers, and weekly reviews.',
  },
];

const defaultCourses = [
  {
    id: 'course-1',
    title: 'Project Planning Fundamentals',
    category: 'Project Planning',
    order: '1',
    summary: 'Define scope, milestones, and a realistic timeline for your STEM Racing season.',
    content: '## Step 1: Define your scope statement\nList every deliverable the judges will evaluate.',
  },
  {
    id: 'course-2',
    title: 'Reading and Building Gantt Charts',
    category: 'Gantt Charts',
    order: '2',
    summary: 'Visualize dependencies and critical path tasks for competition readiness.',
    content: '## What a Gantt chart shows\nTasks on the vertical axis, time on the horizontal axis.',
  },
];

function loadStore() {
  if (existsSync(DATA_FILE)) {
    try {
      return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    } catch {
      /* fall through */
    }
  }
  return { articles: [...defaultArticles], courses: [...defaultCourses] };
}

function saveStore(store) {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

let store = loadStore();

function nextId(prefix) {
  return `${prefix}-${Date.now()}`;
}

export function listArticles({ status = 'approved', category = '', q = '' } = {}) {
  let items = store.articles.filter((a) => a.status === status);
  if (category) items = items.filter((a) => a.category === category);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((a) =>
      `${a.title} ${a.summary} ${a.author} ${a.category}`.toLowerCase().includes(needle),
    );
  }
  items.sort(
    (a, b) =>
      new Date(b.publishedAt || b.submittedAt) - new Date(a.publishedAt || a.submittedAt),
  );
  return items;
}

export function listAllArticles() {
  return [...store.articles].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  );
}

export function getArticle(id) {
  return store.articles.find((a) => a.id === id) || null;
}

export function submitArticle(payload) {
  const now = new Date().toISOString();
  const article = {
    id: nextId('art'),
    title: payload.title,
    author: payload.author,
    category: payload.category || 'General',
    content: payload.content,
    status: 'pending',
    submittedAt: now,
    publishedAt: '',
    rejectionReason: '',
    summary: payload.summary || String(payload.content).slice(0, 180),
    coverImage: payload.coverImage || '',
    pdfUrl: payload.pdfUrl || '',
  };
  store.articles.push(article);
  saveStore(store);
  return article;
}

export function createArticle(payload) {
  const now = new Date().toISOString();
  const status = payload.status || 'approved';
  const article = {
    id: nextId('art'),
    title: payload.title,
    author: payload.author || 'Admin',
    category: payload.category || 'General',
    content: payload.content,
    status,
    submittedAt: now,
    publishedAt: status === 'approved' ? now : '',
    rejectionReason: '',
    summary: payload.summary || String(payload.content).slice(0, 180),
    coverImage: payload.coverImage || '',
    pdfUrl: payload.pdfUrl || '',
  };
  store.articles.push(article);
  saveStore(store);
  return article;
}

export function updateArticle(id, payload) {
  const index = store.articles.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const current = store.articles[index];
  const status = payload.status ?? current.status;
  const updated = {
    ...current,
    title: payload.title ?? current.title,
    author: payload.author ?? current.author,
    category: payload.category ?? current.category,
    content: payload.content ?? current.content,
    summary: payload.summary ?? current.summary,
    coverImage: payload.coverImage !== undefined ? payload.coverImage : current.coverImage,
    pdfUrl: payload.pdfUrl !== undefined ? payload.pdfUrl : current.pdfUrl,
    status,
    rejectionReason: payload.rejectionReason ?? current.rejectionReason,
    publishedAt:
      status === 'approved'
        ? current.publishedAt || new Date().toISOString()
        : payload.publishedAt ?? current.publishedAt,
  };

  store.articles[index] = updated;
  saveStore(store);
  return updated;
}

export function updateArticleStatus(id, status, rejectionReason = '') {
  return updateArticle(id, {
    status,
    rejectionReason: status === 'rejected' ? rejectionReason || 'Not approved.' : '',
  });
}

export function deleteArticle(id) {
  const before = store.articles.length;
  store.articles = store.articles.filter((a) => a.id !== id);
  if (store.articles.length === before) return false;
  saveStore(store);
  return true;
}

export function listCourses({ category = '', q = '' } = {}) {
  let items = [...store.courses];
  if (category) items = items.filter((c) => c.category === category);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((c) =>
      `${c.title} ${c.summary} ${c.category}`.toLowerCase().includes(needle),
    );
  }
  return items.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

export function listAllCourses() {
  return listCourses();
}

export function getCourse(id) {
  return store.courses.find((c) => c.id === id) || null;
}

export function createCourse(payload) {
  const course = {
    id: nextId('course'),
    title: payload.title,
    category: payload.category || 'Project Planning',
    order: String(payload.order ?? store.courses.length + 1),
    summary: payload.summary || '',
    content: payload.content || '',
  };
  store.courses.push(course);
  saveStore(store);
  return course;
}

export function updateCourse(id, payload) {
  const index = store.courses.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = store.courses[index];
  const updated = {
    ...current,
    title: payload.title ?? current.title,
    category: payload.category ?? current.category,
    order: String(payload.order ?? current.order),
    summary: payload.summary ?? current.summary,
    content: payload.content ?? current.content,
  };

  store.courses[index] = updated;
  saveStore(store);
  return updated;
}

export function deleteCourse(id) {
  const before = store.courses.length;
  store.courses = store.courses.filter((c) => c.id !== id);
  if (store.courses.length === before) return false;
  saveStore(store);
  return true;
}

export function handleLocalCommunityRequest(action, { query = {}, body = {} } = {}) {
  switch (action) {
    case 'health':
      return { ok: true, message: 'Community local store is live' };
    case 'listArticles':
      return { success: true, articles: listArticles({ status: query.status || 'approved', category: query.category, q: query.q }) };
    case 'getArticle': {
      const article = getArticle(query.id || body.id);
      if (!article) return { success: false, error: 'Article not found' };
      return { success: true, article };
    }
    case 'listCourses':
      return { success: true, courses: listCourses({ category: query.category, q: query.q }) };
    case 'getCourse': {
      const course = getCourse(query.id || body.id);
      if (!course) return { success: false, error: 'Course not found' };
      return { success: true, course };
    }
    case 'submitArticle': {
      if (!body.title || !body.content || !body.author) {
        return { success: false, error: 'Title, author, and content are required.' };
      }
      const article = submitArticle(body);
      return { success: true, id: article.id, message: 'Article submitted for review.' };
    }
    case 'listPending':
      return { success: true, articles: listArticles({ status: 'pending' }) };
    case 'listAllArticles':
      return { success: true, articles: listAllArticles() };
    case 'listAllCourses':
      return { success: true, courses: listAllCourses() };
    case 'createArticle': {
      if (!body.title || !body.content) {
        return { success: false, error: 'Title and content are required.' };
      }
      const article = createArticle(body);
      return { success: true, article, message: 'Article created.' };
    }
    case 'updateArticle': {
      const updated = updateArticle(body.id, body);
      if (!updated) return { success: false, error: 'Article not found' };
      return { success: true, article: updated, message: 'Article updated.' };
    }
    case 'approveArticle':
      return updateArticleStatus(body.id, 'approved', '')
        ? { success: true, message: 'Article approved.' }
        : { success: false, error: 'Article not found' };
    case 'rejectArticle':
      return updateArticleStatus(body.id, 'rejected', body.rejectionReason)
        ? { success: true, message: 'Article rejected.' }
        : { success: false, error: 'Article not found' };
    case 'deleteArticle':
      return deleteArticle(body.id)
        ? { success: true, message: 'Article deleted.' }
        : { success: false, error: 'Article not found' };
    case 'createCourse': {
      if (!body.title || !body.content) {
        return { success: false, error: 'Title and content are required.' };
      }
      const course = createCourse(body);
      return { success: true, course, message: 'Course created.' };
    }
    case 'updateCourse': {
      const updated = updateCourse(body.id, body);
      if (!updated) return { success: false, error: 'Course not found' };
      return { success: true, course: updated, message: 'Course updated.' };
    }
    case 'deleteCourse':
      return deleteCourse(body.id)
        ? { success: true, message: 'Course deleted.' }
        : { success: false, error: 'Course not found' };
    default:
      return { success: false, error: `Unknown action: ${action}` };
  }
}
