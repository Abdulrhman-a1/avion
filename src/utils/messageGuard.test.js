import { describe, expect, it } from 'vitest';
import {
  containsProfanity,
  getGuardedReply,
  isUnsupportedLanguage,
} from './messageGuard';

describe('containsProfanity', () => {
  it('flags vulgar english', () => {
    expect(containsProfanity('what the fuck')).toBe(true);
    expect(containsProfanity('you are stupid asshole')).toBe(true);
  });

  it('flags vulgar arabic', () => {
    expect(containsProfanity('يا كلب')).toBe(true);
  });

  it('allows normal english', () => {
    expect(containsProfanity('Who was the project manager?')).toBe(false);
  });
});

describe('isUnsupportedLanguage', () => {
  it('flags arabic messages', () => {
    expect(isUnsupportedLanguage('من هو مدير المشروع؟')).toBe(true);
  });

  it('allows english messages', () => {
    expect(isUnsupportedLanguage('How many SDGs did AVION contribute to?')).toBe(false);
  });
});

describe('getGuardedReply', () => {
  it('prioritises profanity over language', () => {
    const reply = getGuardedReply('يا كلب');
    expect(reply?.type).toBe('profanity');
  });

  it('returns language reply for arabic', () => {
    const reply = getGuardedReply('مرحبا كيف حالك');
    expect(reply?.type).toBe('language');
  });

  it('returns null for normal english', () => {
    expect(getGuardedReply('Tell me about engineering')).toBeNull();
  });
});
