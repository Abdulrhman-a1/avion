import { describe, it, expect } from 'vitest';
import { splitMessages } from './splitMessages';

describe('splitMessages', () => {
  it('returns all messages as history when no bot message', () => {
    const messages = [
      { id: '1', type: 'user', text: 'hi' },
    ];
    expect(splitMessages(messages)).toEqual({
      latestBotMessage: null,
      historyMessages: messages,
    });
  });

  it('splits latest bot from history', () => {
    const messages = [
      { id: '1', type: 'user', text: 'a' },
      { id: '2', type: 'bot', text: 'b' },
      { id: '3', type: 'user', text: 'c' },
      { id: '4', type: 'bot', text: 'd' },
    ];
    const result = splitMessages(messages);
    expect(result.latestBotMessage).toEqual(messages[3]);
    expect(result.historyMessages).toEqual(messages.slice(0, 3));
  });

  it('uses typing as latest bubble', () => {
    const messages = [
      { id: '1', type: 'user', text: 'a' },
      { id: 'typing', type: 'typing' },
    ];
    const result = splitMessages(messages);
    expect(result.latestBotMessage.type).toBe('typing');
    expect(result.historyMessages).toHaveLength(1);
  });
});
