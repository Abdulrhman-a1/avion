const END_CHAT_PATTERNS = [
  /\b(end|finish|stop|close)\s+(the\s+)?chat\b/i,
  /\b(bye|goodbye|see you)\b/i,
  /\b(that'?s?\s+all|i'?m\s+done|all done)\b/i,
  /(بنهي|انهي|أنهي|خلص|انتهى|انهاء|إنهاء)\s*(ال)?(شات|محادثة|كلام)?/i,
  /^(شكرا|thanks|thank you)[\s!.]*$/i,
];

export function isEndChatIntent(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return END_CHAT_PATTERNS.some((pattern) => pattern.test(trimmed));
}
