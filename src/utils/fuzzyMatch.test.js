import { describe, expect, it } from 'vitest';
import {
  findAnswer,
  isLowSignalQuery,
  isRelevantMatch,
  getAnswerById,
} from './fuzzyMatch';
import questions from '../data/questions';

describe('isLowSignalQuery', () => {
  it('blocks test and other noise words', () => {
    expect(isLowSignalQuery('test')).toBe(true);
    expect(isLowSignalQuery('TEST')).toBe(true);
    expect(isLowSignalQuery('hi')).toBe(true);
    expect(isLowSignalQuery('hello')).toBe(true);
    expect(isLowSignalQuery('asdf')).toBe(true);
  });

  it('allows real short keywords from the dataset', () => {
    expect(isLowSignalQuery('SDG')).toBe(false);
  });

  it('allows normal questions', () => {
    expect(isLowSignalQuery('How many SDGs did AVION contribute to?')).toBe(false);
    expect(isLowSignalQuery('engineering loop')).toBe(false);
  });
});

describe('findAnswer', () => {
  it('does not answer random input like test', () => {
    const result = findAnswer('test');
    expect(result.type).toBe('no_match');
    expect(result.answer).toBeUndefined();
  });

  it('matches a clear enterprise question', () => {
    const result = findAnswer('How many SDGs did AVION contribute to?');
    expect(result.type).toBe('match');
    expect(result.answer).toContain('13 United Nations Sustainable Development Goals');
    expect(result.category).toBe('Enterprise');
  });

  it('includes image for project manager question', () => {
    const result = findAnswer("Who was AVION's Project Manager?");
    expect(['match', 'close_match']).toContain(result.type);
    expect(result.image).toBe('/assets/Project managment file/Project.manager.JPG');
  });

  it('matches a partial engineering query', () => {
    const result = findAnswer('What is the engineering loop');
    expect(['match', 'close_match']).toContain(result.type);
    expect(result.answer?.toLowerCase()).toContain('design');
  });

  it('does not force an answer for unrelated gibberish', () => {
    const result = findAnswer('xyz qwerty nonsense');
    expect(['no_match', 'suggest']).toContain(result.type);
    if (result.type === 'match') {
      expect.fail('Should not return a direct match for gibberish');
    }
  });
});

describe('isRelevantMatch', () => {
  it('rejects substring-only hits like test inside testing', () => {
    const item = questions.find((q) => q.id === 'q6');
    expect(item).toBeTruthy();
    expect(isRelevantMatch('test', item, 0.3)).toBe(false);
  });
});

describe('getAnswerById', () => {
  it('returns a known answer by id', () => {
    const result = getAnswerById('q1');
    expect(result?.answer).toContain('13 United Nations');
  });

  it('returns image fields for answers that have them', () => {
    const result = getAnswerById('q52');
    expect(result?.image).toBe('/assets/Project managment file/Project.manager.JPG');
    expect(result?.imageAlt).toContain('Majd Aljiawy');
  });
});
