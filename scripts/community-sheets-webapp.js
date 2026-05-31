/**
 * Paste into Google Sheets → Extensions → Apps Script (Community spreadsheet)
 *
 * Create a spreadsheet with sheets: Articles, Courses, Admin
 *
 * Articles headers: id | title | author | category | content | status | submittedAt | publishedAt | rejectionReason | summary
 * Courses headers: id | title | category | order | content | summary
 * Admin headers: passwordHash
 *
 * Set SPREADSHEET_ID and ADMIN_PASSWORD below.
 * Deploy → Web app → Execute as: Me → Who has access: Anyone
 * Copy /exec URL to GOOGLE_COMMUNITY_SHEETS_URL
 */

const SPREADSHEET_ID = 'YOUR_COMMUNITY_SPREADSHEET_ID';
const ADMIN_PASSWORD = 'change-me';
const ADMIN_TOKEN_SALT = 'avion-pm-community';

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    const params = e.parameter || {};
    let payload = {};

    if (method === 'POST' && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action || params.action || 'health';
    const adminToken = payload.adminToken || params.adminToken || (e.parameter && e.parameter.adminToken) || '';

    switch (action) {
      case 'health':
        return json({ ok: true, message: 'Community API is live' });
      case 'listArticles':
        return json(listArticles(params.status || payload.status || 'approved', params.category, params.q));
      case 'getArticle':
        return json(getArticle(params.id || payload.id));
      case 'listCourses':
        return json(listCourses(params.category, params.q));
      case 'getCourse':
        return json(getCourse(params.id || payload.id));
      case 'submitArticle':
        return json(submitArticle(payload));
      case 'adminLogin':
        return json(adminLogin(payload.password));
      case 'listPending':
        requireAdmin(adminToken);
        return json(listArticles('pending'));
      case 'listAllArticles':
        requireAdmin(adminToken);
        return json(listAllArticlesAdmin());
      case 'approveArticle':
        requireAdmin(adminToken);
        return json(updateArticleStatus(payload.id, 'approved', ''));
      case 'rejectArticle':
        requireAdmin(adminToken);
        return json(updateArticleStatus(payload.id, 'rejected', payload.rejectionReason || ''));
      case 'deleteArticle':
        requireAdmin(adminToken);
        return json(deleteArticle(payload.id));
      case 'createArticle':
        requireAdmin(adminToken);
        return json(createArticleAdmin(payload));
      case 'updateArticle':
        requireAdmin(adminToken);
        return json(updateArticleAdmin(payload));
      case 'listAllCourses':
        requireAdmin(adminToken);
        return json({ success: true, courses: listCourses('', '') });
      case 'createCourse':
        requireAdmin(adminToken);
        return json(createCourseAdmin(payload));
      case 'updateCourse':
        requireAdmin(adminToken);
        return json(updateCourseAdmin(payload));
      case 'deleteCourse':
        requireAdmin(adminToken);
        return json(deleteCourse(payload.id));
      default:
        return json({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return json({ success: false, error: String(err.message || err) });
  }
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_(name) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Articles') {
      sheet.appendRow(['id', 'title', 'author', 'category', 'content', 'status', 'submittedAt', 'publishedAt', 'rejectionReason', 'summary']);
    } else if (name === 'Courses') {
      sheet.appendRow(['id', 'title', 'category', 'order', 'content', 'summary']);
    } else if (name === 'Admin') {
      sheet.appendRow(['passwordHash']);
      sheet.getRange(2, 1).setValue(hashPassword_(ADMIN_PASSWORD));
    }
  }
  return sheet;
}

function rowsToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(function (row) { return row[0]; }).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i] instanceof Date ? row[i].toISOString() : String(row[i] || ''); });
    return obj;
  });
}

function listArticles(status, category, q) {
  const sheet = getSheet_('Articles');
  let items = rowsToObjects_(sheet).filter(function (a) { return a.status === status; });
  if (category) items = items.filter(function (a) { return a.category === category; });
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter(function (a) {
      return (a.title + a.summary + a.author + a.category).toLowerCase().indexOf(needle) !== -1;
    });
  }
  items.sort(function (a, b) { return new Date(b.publishedAt || b.submittedAt) - new Date(a.publishedAt || a.submittedAt); });
  return { success: true, articles: items };
}

function listAllArticlesAdmin() {
  const sheet = getSheet_('Articles');
  const items = rowsToObjects_(sheet);
  items.sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  return { success: true, articles: items };
}

function getArticle(id) {
  const sheet = getSheet_('Articles');
  const item = rowsToObjects_(sheet).find(function (a) { return a.id === id; });
  if (!item) return { success: false, error: 'Article not found' };
  return { success: true, article: item };
}

function listCourses(category, q) {
  const sheet = getSheet_('Courses');
  let items = rowsToObjects_(sheet);
  if (category) items = items.filter(function (c) { return c.category === category; });
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter(function (c) {
      return (c.title + c.summary + c.category).toLowerCase().indexOf(needle) !== -1;
    });
  }
  items.sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); });
  return { success: true, courses: items };
}

function getCourse(id) {
  const sheet = getSheet_('Courses');
  const item = rowsToObjects_(sheet).find(function (c) { return c.id === id; });
  if (!item) return { success: false, error: 'Course not found' };
  return { success: true, course: item };
}

function submitArticle(payload) {
  if (!payload.title || !payload.content || !payload.author) {
    return { success: false, error: 'Title, author, and content are required.' };
  }
  const sheet = getSheet_('Articles');
  const id = 'art-' + new Date().getTime();
  const now = new Date().toISOString();
  const summary = payload.summary || String(payload.content).slice(0, 180);
  sheet.appendRow([
    id,
    payload.title,
    payload.author,
    payload.category || 'General',
    payload.content,
    'pending',
    now,
    '',
    '',
    summary,
  ]);
  return { success: true, id: id, message: 'Article submitted for review.' };
}

function adminLogin(password) {
  if (String(password) !== String(ADMIN_PASSWORD)) {
    return { success: false, error: 'Invalid password.' };
  }
  return { success: true, adminToken: makeAdminToken_(password) };
}

function requireAdmin(token) {
  if (!token || token !== makeAdminToken_(ADMIN_PASSWORD)) {
    throw new Error('Unauthorized');
  }
}

function makeAdminToken_(password) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + ADMIN_TOKEN_SALT + SPREADSHEET_ID);
  return raw.map(function (b) {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function hashPassword_(password) {
  return makeAdminToken_(password);
}

function updateArticleStatus(id, status, rejectionReason) {
  const sheet = getSheet_('Articles');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('id');
  const statusCol = headers.indexOf('status');
  const pubCol = headers.indexOf('publishedAt');
  const rejCol = headers.indexOf('rejectionReason');
  for (var i = 1; i < values.length; i++) {
    if (values[i][idCol] === id) {
      sheet.getRange(i + 1, statusCol + 1).setValue(status);
      if (status === 'approved') {
        sheet.getRange(i + 1, pubCol + 1).setValue(new Date().toISOString());
        sheet.getRange(i + 1, rejCol + 1).setValue('');
      }
      if (status === 'rejected') {
        sheet.getRange(i + 1, rejCol + 1).setValue(rejectionReason || 'Not approved.');
      }
      return { success: true, message: 'Article updated.' };
    }
  }
  return { success: false, error: 'Article not found' };
}

function deleteArticle(id) {
  const sheet = getSheet_('Articles');
  const values = sheet.getDataRange().getValues();
  const idCol = values[0].indexOf('id');
  for (var i = 1; i < values.length; i++) {
    if (values[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Article deleted.' };
    }
  }
  return { success: false, error: 'Article not found' };
}

function createArticleAdmin(payload) {
  if (!payload.title || !payload.content) {
    return { success: false, error: 'Title and content are required.' };
  }
  const sheet = getSheet_('Articles');
  const id = 'art-' + new Date().getTime();
  const now = new Date().toISOString();
  const status = payload.status || 'approved';
  const summary = payload.summary || String(payload.content).slice(0, 180);
  sheet.appendRow([
    id,
    payload.title,
    payload.author || 'Admin',
    payload.category || 'General',
    payload.content,
    status,
    now,
    status === 'approved' ? now : '',
    '',
    summary,
  ]);
  return { success: true, id: id, message: 'Article created.' };
}

function updateArticleAdmin(payload) {
  if (!payload.id) return { success: false, error: 'Article id is required.' };
  const sheet = getSheet_('Articles');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const cols = {
    id: headers.indexOf('id'),
    title: headers.indexOf('title'),
    author: headers.indexOf('author'),
    category: headers.indexOf('category'),
    content: headers.indexOf('content'),
    status: headers.indexOf('status'),
    publishedAt: headers.indexOf('publishedAt'),
    rejectionReason: headers.indexOf('rejectionReason'),
    summary: headers.indexOf('summary'),
  };
  for (var i = 1; i < values.length; i++) {
    if (values[i][cols.id] === payload.id) {
      if (payload.title !== undefined) sheet.getRange(i + 1, cols.title + 1).setValue(payload.title);
      if (payload.author !== undefined) sheet.getRange(i + 1, cols.author + 1).setValue(payload.author);
      if (payload.category !== undefined) sheet.getRange(i + 1, cols.category + 1).setValue(payload.category);
      if (payload.content !== undefined) sheet.getRange(i + 1, cols.content + 1).setValue(payload.content);
      if (payload.summary !== undefined) sheet.getRange(i + 1, cols.summary + 1).setValue(payload.summary);
      if (payload.status !== undefined) {
        sheet.getRange(i + 1, cols.status + 1).setValue(payload.status);
        if (payload.status === 'approved') {
          sheet.getRange(i + 1, cols.publishedAt + 1).setValue(new Date().toISOString());
          sheet.getRange(i + 1, cols.rejectionReason + 1).setValue('');
        }
      }
      return { success: true, message: 'Article updated.' };
    }
  }
  return { success: false, error: 'Article not found' };
}

function createCourseAdmin(payload) {
  if (!payload.title || !payload.content) {
    return { success: false, error: 'Title and content are required.' };
  }
  const sheet = getSheet_('Courses');
  const id = 'course-' + new Date().getTime();
  sheet.appendRow([
    id,
    payload.title,
    payload.category || 'Project Planning',
    payload.order || sheet.getLastRow(),
    payload.content,
    payload.summary || '',
  ]);
  return { success: true, id: id, message: 'Course created.' };
}

function updateCourseAdmin(payload) {
  if (!payload.id) return { success: false, error: 'Course id is required.' };
  const sheet = getSheet_('Courses');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const cols = {
    id: headers.indexOf('id'),
    title: headers.indexOf('title'),
    category: headers.indexOf('category'),
    order: headers.indexOf('order'),
    content: headers.indexOf('content'),
    summary: headers.indexOf('summary'),
  };
  for (var i = 1; i < values.length; i++) {
    if (values[i][cols.id] === payload.id) {
      if (payload.title !== undefined) sheet.getRange(i + 1, cols.title + 1).setValue(payload.title);
      if (payload.category !== undefined) sheet.getRange(i + 1, cols.category + 1).setValue(payload.category);
      if (payload.order !== undefined) sheet.getRange(i + 1, cols.order + 1).setValue(payload.order);
      if (payload.content !== undefined) sheet.getRange(i + 1, cols.content + 1).setValue(payload.content);
      if (payload.summary !== undefined) sheet.getRange(i + 1, cols.summary + 1).setValue(payload.summary);
      return { success: true, message: 'Course updated.' };
    }
  }
  return { success: false, error: 'Course not found' };
}

function deleteCourse(id) {
  const sheet = getSheet_('Courses');
  const values = sheet.getDataRange().getValues();
  const idCol = values[0].indexOf('id');
  for (var i = 1; i < values.length; i++) {
    if (values[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Course deleted.' };
    }
  }
  return { success: false, error: 'Course not found' };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
