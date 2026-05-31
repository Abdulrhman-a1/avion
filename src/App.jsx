import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import SpeechBubble from './components/SpeechBubble';
import InputBar from './components/InputBar';
import Evaluation from './components/Evaluation';
import CarModel from './components/CarModel';
import { findAnswer, getAnswerById, getQuestionsByCategory } from './utils/fuzzyMatch';
import { isEndChatIntent } from './utils/endChat';
import { getGuardedReply } from './utils/messageGuard';
import { splitMessages } from './utils/splitMessages';

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

const END_CHAT_MESSAGE =
  "Thanks for chatting with AVION! I'd love your feedback before you go.";

function App() {
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const typingTimeoutRef = useRef(null);
  const latestBubbleIdRef = useRef(null);

  const { latestBotMessage, historyMessages } = useMemo(
    () => splitMessages(messages),
    [messages],
  );

  useEffect(() => {
    const bubbleId = latestBotMessage?.id;
    if (!bubbleId || bubbleId === latestBubbleIdRef.current) return;
    latestBubbleIdRef.current = bubbleId;
    setHistoryExpanded(false);
  }, [latestBotMessage?.id]);

  const addBotMessage = useCallback((text, extra = {}) => {
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== 'typing'),
      { id: nextId(), type: 'bot', text, timestamp: Date.now(), ...extra },
    ]);
    setIsTyping(false);
  }, []);

  const simulateTyping = useCallback((callback) => {
    setIsTyping(true);
    setMessages((prev) => [...prev, { id: 'typing', type: 'typing' }]);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(callback, 700 + Math.random() * 800);
  }, []);

  const enterChatMode = useCallback(() => {
    setChatMode(true);
  }, []);

  const openEvaluation = useCallback(() => {
    setChatEnded(true);
    setTimeout(() => setShowEvaluation(true), 600);
  }, []);

  const finishChat = useCallback(() => {
    if (chatEnded || isTyping) return;

    simulateTyping(() => {
      addBotMessage(END_CHAT_MESSAGE);
      openEvaluation();
    });
  }, [chatEnded, isTyping, simulateTyping, addBotMessage, openEvaluation]);

  const handleSend = useCallback((text) => {
    if (chatEnded) return;

    enterChatMode();

    setMessages((prev) => [
      ...prev,
      { id: nextId(), type: 'user', text, timestamp: Date.now() },
    ]);

    setMessageCount((count) => count + 1);

    if (isEndChatIntent(text)) {
      finishChat();
      return;
    }

    const guarded = getGuardedReply(text);
    if (guarded) {
      simulateTyping(() => {
        addBotMessage(guarded.message, { tone: guarded.type });
      });
      return;
    }

    simulateTyping(() => {
      const result = findAnswer(text);

      if (result.type === 'match' || result.type === 'close_match') {
        addBotMessage(result.answer, {
          category: result.category,
          matchedQuestion: result.type === 'close_match' ? result.matchedQuestion : undefined,
          image: result.image,
          imageAlt: result.imageAlt,
        });
      } else if (result.type === 'suggest') {
        addBotMessage(result.message, { suggestions: result.suggestions });
      } else {
        addBotMessage(result.message, { suggestions: result.suggestions });
      }
    });
  }, [chatEnded, simulateTyping, addBotMessage, enterChatMode, finishChat]);

  const handleSelectCategory = useCallback((category) => {
    enterChatMode();

    setMessages([
      { id: nextId(), type: 'user', text: category, timestamp: Date.now() },
    ]);

    simulateTyping(() => {
      addBotMessage(
        `Great pick! Here are some ${category} questions — tap one whenever you're ready.`,
        { suggestions: getQuestionsByCategory(category).slice(0, 6) },
      );
    });
  }, [simulateTyping, addBotMessage, enterChatMode]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    if (chatEnded) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), type: 'user', text: suggestion.question, timestamp: Date.now() },
    ]);

    setMessageCount((count) => count + 1);

    simulateTyping(() => {
      const result = getAnswerById(suggestion.id);
      if (result) {
        addBotMessage(result.answer, {
          category: result.category,
          image: result.image,
          imageAlt: result.imageAlt,
        });
      }
    });
  }, [chatEnded, simulateTyping, addBotMessage]);

  const handleGoHome = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setChatMode(false);
    setMessages([]);
    setIsTyping(false);
    setShowEvaluation(false);
    setChatEnded(false);
    setMessageCount(0);
    setHistoryExpanded(false);
    latestBubbleIdRef.current = null;
  }, []);

  const handleEvaluationSubmitted = useCallback(() => {
    setShowEvaluation(false);
    handleGoHome();
  }, [handleGoHome]);

  const handleEvaluationClose = useCallback(() => {
    setShowEvaluation(false);
    if (chatEnded) handleGoHome();
  }, [chatEnded, handleGoHome]);

  const toggleHistory = useCallback(() => {
    setHistoryExpanded((v) => !v);
  }, []);

  const animateSpeechTypewriter = latestBotMessage?.type === 'bot';

  return (
    <div className="app-shell">
      <Header showBackToHome={chatMode} onBackToHome={handleGoHome} />

      <main className={`app-main ${chatMode ? 'chat-mode' : ''}`}>
        {!chatMode && (
          <WelcomeScreen
            onSelectCategory={handleSelectCategory}
            isResponding={isTyping}
          />
        )}

        {chatMode && (
          <>
            <section className="speech-section">
              <div className="speech-orb-wrap">
                <div className="orb speech-orb">
                  <CarModel isTyping={isTyping} presentation="chat" />
                </div>
                <span className={`speech-orb-status ${isTyping ? 'speech-orb-typing' : ''}`}>
                  {isTyping ? 'Thinking…' : 'Nakhil'}
                </span>
              </div>

              <SpeechBubble
                message={latestBotMessage}
                isTyping={isTyping && latestBotMessage?.type === 'typing'}
                animateTypewriter={animateSpeechTypewriter}
                onSelectSuggestion={handleSelectSuggestion}
              />
            </section>

            <ChatArea
              messages={historyMessages}
              collapsed={!historyExpanded}
              onToggleCollapse={toggleHistory}
              onSelectSuggestion={handleSelectSuggestion}
            />
          </>
        )}

        <InputBar
          onSend={handleSend}
          onEndChat={finishChat}
          onBackToHome={handleGoHome}
          showEndChat={chatMode && !chatEnded && !showEvaluation}
          showBackToHome={chatMode && (chatEnded || showEvaluation)}
          disabled={(chatMode && isTyping) || showEvaluation || chatEnded}
        />
      </main>

      <AnimatePresence>
        {showEvaluation && (
          <Evaluation
            messageCount={messageCount}
            onSubmitted={handleEvaluationSubmitted}
            onClose={handleEvaluationClose}
            onGoHome={handleGoHome}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
