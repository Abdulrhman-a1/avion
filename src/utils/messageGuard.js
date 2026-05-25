const PROFANITY_PATTERNS = [
  /\b(f+u+c+k+|sh+i+t+|b+i+t+c+h+|asshole|bastard|cunt|dickhead|motherfucker|mf)\b/i,
  /\b(stfu|wtf|f off|fuck off|go to hell)\b/i,
  /\b(piss\s*off|screw\s*you|son of a bitch)\b/i,
  /(كس|زب|شرمو|عرص|خول|منيك|نيك|يلعن|العن\s+أمك|العن\s+امك|يا\s*كلب|يا\s*حمار|يا\s*غبي|قحب|زبال)/i,
];

const NON_ENGLISH_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0400-\u04FF\u4E00-\u9FFF\u0900-\u097F\u0980-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\uAC00-\uD7AF]/;

export const PROFANITY_REPLY =
  "Whoa—easy. I'm not here for insults or foul language. Respect yourself, yeah? Keep it friendly and ask me about AVION.";

export const LANGUAGE_REPLY =
  "Sorry, I didn't catch that. I only understand English for now. Try asking in English about Enterprise, Engineering, or Project Management.";

export function containsProfanity(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return PROFANITY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isUnsupportedLanguage(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (NON_ENGLISH_SCRIPT.test(trimmed)) return true;

  const letters = trimmed.match(/\p{L}/gu);
  if (!letters?.length) return false;

  const latinLetters = trimmed.match(/[a-zA-Z]/g);
  const latinRatio = (latinLetters?.length ?? 0) / letters.length;
  return latinRatio < 0.7;
}

export function getGuardedReply(text) {
  if (containsProfanity(text)) {
    return { type: 'profanity', message: PROFANITY_REPLY };
  }

  if (isUnsupportedLanguage(text)) {
    return { type: 'language', message: LANGUAGE_REPLY };
  }

  return null;
}
