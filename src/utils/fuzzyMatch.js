import Fuse from 'fuse.js';
import questions from '../data/questions';

const fuse = new Fuse(questions, {
  keys: [
    { name: 'question', weight: 0.6 },
    { name: 'keywords', weight: 0.3 },
    { name: 'answer', weight: 0.1 },
  ],
  threshold: 0.42,
  includeScore: true,
  minMatchCharLength: 3,
  ignoreLocation: true,
});

const LOW_SIGNAL_QUERIES = new Set([
  'test',
  'testing',
  'hi',
  'hello',
  'hey',
  'ok',
  'okay',
  'yes',
  'no',
  'help',
  'asdf',
  'abc',
  'lol',
  'hmm',
  'thanks',
  'thank you',
  'bye',
  'goodbye',
]);

const NO_MATCH_MESSAGE =
  "Hmm, I'm not sure about that one sorry! Try asking about Enterprise, Engineering, or Project Management, or pick a topic below.";

function normalizeQuery(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsWord(text, word) {
  if (!word) return false;
  return new RegExp(`\\b${escapeRegExp(word)}`, 'i').test(text);
}

function hasExactKeywordMatch(query) {
  return questions.some((item) => {
    const keywordHit = (item.keywords || []).some(
      (keyword) => normalizeQuery(keyword) === query,
    );
    if (keywordHit) return true;

    return normalizeQuery(item.question)
      .split(/\s+/)
      .some((word) => word.replace(/[^\w'-]/g, '') === query);
  });
}

export function isLowSignalQuery(userQuery) {
  const normalized = normalizeQuery(userQuery);
  if (!normalized) return true;
  if (LOW_SIGNAL_QUERIES.has(normalized)) return true;
  if (hasExactKeywordMatch(normalized)) return false;

  const words = normalized.split(' ').filter(Boolean);
  if (words.length === 1 && normalized.length < 5) return true;

  return false;
}

export function isRelevantMatch(userQuery, item, score) {
  const normalized = normalizeQuery(userQuery);
  const words = normalized.split(' ').filter((word) => word.length > 2);
  const haystack = [item.question, ...(item.keywords || [])].join(' ');

  if (words.length === 0) {
    return score <= 0.2 || hasExactKeywordMatch(normalized);
  }

  const matchedCount = words.filter((word) => containsWord(haystack, word)).length;
  const matchRatio = matchedCount / words.length;

  if (matchRatio >= 0.6) return true;
  if (matchRatio >= 0.34 && score <= 0.28) return true;
  return score <= 0.16;
}

function resolveImagePath(path) {
  if (!path) return undefined;
  if (path.startsWith('/')) return path;
  if (path.startsWith('public/')) return `/${path.slice('public/'.length)}`;
  return path.startsWith('assets/') ? `/${path}` : path;
}

function answerFields(item) {
  return {
    answer: item.answer,
    matchedQuestion: item.question,
    category: item.category,
    image: resolveImagePath(item.image),
    imageAlt: item.imageAlt,
  };
}

export function findAnswer(userQuery) {
  if (isLowSignalQuery(userQuery)) {
    return {
      type: 'no_match',
      message: NO_MATCH_MESSAGE,
      suggestions: getRandomByCategory(),
    };
  }

  const results = fuse.search(userQuery);

  if (results.length === 0) {
    return {
      type: 'no_match',
      message: NO_MATCH_MESSAGE,
      suggestions: getRandomByCategory(),
    };
  }

  const best = results[0];

  if (best.score <= 0.35 && isRelevantMatch(userQuery, best.item, best.score)) {
    return {
      type: 'match',
      ...answerFields(best.item),
      suggestions: getRelated(best.item),
    };
  }

  if (best.score <= 0.48 && isRelevantMatch(userQuery, best.item, best.score)) {
    return {
      type: 'close_match',
      ...answerFields(best.item),
      suggestions: getRelated(best.item),
    };
  }

  const topSuggestions = results
    .slice(0, 3)
    .filter((result) => isRelevantMatch(userQuery, result.item, result.score))
    .map((result) => ({
      id: result.item.id,
      question: result.item.question,
      category: result.item.category,
    }));

  if (topSuggestions.length === 0) {
    return {
      type: 'no_match',
      message: NO_MATCH_MESSAGE,
      suggestions: getRandomByCategory(),
    };
  }

  return {
    type: 'suggest',
    message: 'I found a few related topics did you mean one of these?',
    suggestions: topSuggestions,
  };
}

export function getAnswerById(id) {
  const q = questions.find((item) => item.id === id);
  if (!q) return null;
  return {
    type: 'match',
    ...answerFields(q),
    suggestions: getRelated(q),
  };
}

function getRelated(item) {
  if (!item.related) return [];
  return item.related
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean)
    .map((q) => ({ id: q.id, question: q.question, category: q.category }));
}

function getRandomByCategory() {
  const categories = ['Enterprise', 'Engineering', 'Project Management'];
  return categories.map((cat) => {
    const catQuestions = questions.filter((q) => q.category === cat);
    const random = catQuestions[Math.floor(Math.random() * catQuestions.length)];
    return { id: random.id, question: random.question, category: random.category };
  });
}

export function getQuestionsByCategory(category) {
  return questions
    .filter((q) => q.category === category)
    .map((q) => ({ id: q.id, question: q.question, category: q.category }));
}
