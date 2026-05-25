const PROFANITY_PATTERNS = [
  /\b(f+u+c+k+|sh+i+t+|b+i+t+c+h+|asshole|bastard|cunt|dickhead|motherfucker|mf)\b/i,
  /\b(stfu|wtf|f off|fuck off|go to hell)\b/i,
  /\b(piss\s*off|screw\s*you|son of a bitch)\b/i,
  /(كس|زب|شرمو|عرص|خول|منيك|نيك|يلعن|العن\s+أمك|العن\s+امك|يا\s*كلب|يا\s*حمار|يا\s*غبي|قحب|زبال)/i,
];

const GREETING_PATTERNS = [
  /^\s*(h+e+y+|h+i+|hello+|howdy|yo+|sup|what'?s?\s*up|hola|he)\s*[!.,?]*\s*$/i,
  /^\s*how\s+(are|r)\s+(you|u|ya)[\s?!.]*$/i,
  /^\s*(good\s+(morning|evening|afternoon|night)|gm|gn)\s*[!.,?]*\s*$/i,
  /^\s*(what'?s?\s*good|how'?s?\s*it\s*going|how\s*do\s*you\s*do)\s*[!.,?]*\s*$/i,
];

const NON_ENGLISH_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0400-\u04FF\u4E00-\u9FFF\u0900-\u097F\u0980-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\uAC00-\uD7AF]/;

export const PROFANITY_REPLY =
  "Whoa—easy. I'm not here for insults or foul language. Respect yourself, yeah? Keep it friendly and ask Nakhil about the team.";

const GREETING_REPLIES = [
  "Hey there! I'm Nakhil, AVION's AI assistant. I can tell you all about our Enterprise, Engineering, and Project Management teams. What would you like to know?",
  "Hi! Good to see you here. I'm Nakhil, ask me anything about AVION's teams and I'll fill you in!",
  "Hello! Welcome to AVION. I'm here to answer your questions about Enterprise, Engineering, or Project Management. Fire away!",
  "Hey! What's on your mind? I can help you learn about our teams, just pick a topic or ask a question.",
  "Yo! I'm Nakhil, your guide to everything AVION. Curious about Enterprise, Engineering, or PM? Let's go!",
  "Hi there! Nice to meet you. I know a lot about AVION's teams, what are you curious about?",
  "Hey hey! Ready when you are. Ask me about Enterprise, Engineering, or Project Management!",
];

export const LANGUAGE_REPLY =
  "Sorry, I didn't catch that. I only understand English for now. Try asking in English about Enterprise, Engineering, or Project Management.";

export function containsProfanity(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return PROFANITY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isGreeting(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return GREETING_PATTERNS.some((pattern) => pattern.test(trimmed));
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

  if (isGreeting(text)) {
    const reply = GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];
    return { type: 'greeting', message: reply };
  }

  return null;
}
