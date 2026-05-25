/**
 * Splits chat messages into the active bot/typing bubble and prior history.
 */
export function splitMessages(messages) {
  let latestIndex = -1;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const t = messages[i].type;
    if (t === 'bot' || t === 'typing') {
      latestIndex = i;
      break;
    }
  }

  if (latestIndex === -1) {
    return {
      latestBotMessage: null,
      historyMessages: messages,
    };
  }

  return {
    latestBotMessage: messages[latestIndex],
    historyMessages: messages.slice(0, latestIndex),
  };
}
