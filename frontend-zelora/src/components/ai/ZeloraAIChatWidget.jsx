import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  X,
  Send,
  ArrowUp,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { aiApi, getActiveAuthToken, getActiveAuthUser } from '../../services/aiApi';
import './aiChat.css';

export default function ZeloraAIChatWidget() {
  const { user: authUser } = useAuth();
  const location = useLocation();

  const [activeUser, setActiveUser] = useState(() => authUser || getActiveAuthUser());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [preferredProvider, setPreferredProvider] = useState('gemini'); // 'gemini' | 'groq'
  const [activeProviderBadge, setActiveProviderBadge] = useState('Gemini 3.5');
  const messagesEndRef = useRef(null);

  // Synchronize authenticated user state whenever route, storage, or auth context updates
  useEffect(() => {
    const checkAuth = () => {
      const token = getActiveAuthToken();
      const userObj = authUser || getActiveAuthUser();
      if (token && userObj) {
        setActiveUser(userObj);
      } else {
        setActiveUser(null);
        setIsOpen(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [authUser, location.pathname]);

  // Seed personalized greeting when chat is first opened by authenticated user
  useEffect(() => {
    if (isOpen && activeUser && messages.length === 0) {
      const firstName =
        activeUser.first_name ||
        activeUser.name?.split(' ')[0] ||
        (activeUser.email ? activeUser.email.split('@')[0] : 'Client');

      const role =
        activeUser.is_staff || activeUser.role?.toLowerCase().includes('admin')
          ? 'Administrator'
          : (activeUser.is_seller ? 'Boutique Seller' : 'Valued Client');

      setMessages([
        {
          id: 'init-1',
          role: 'assistant',
          content: `Hi ${firstName}! 👋 Welcome to your private ZELORA Assistant. As a verified ${role}, how may I assist your wardrobe, orders, or boutique today?`,
          provider: 'gemini',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, activeUser]);

  // Strictly do NOT render the AI assistant widget if the user is not logged in
  if (!activeUser || !getActiveAuthToken()) {
    return null;
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    const token = getActiveAuthToken();
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: 'user',
          content: prompt,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: "Authentication Required: Please sign in to your ZELORA account to query database records, orders, or boutique telemetry.",
          provider: 'security',
          isAuthRequired: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setInputText('');
      return;
    }

    // Append User Message to UI
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await aiApi.sendMessage(prompt, conversationId, preferredProvider);

      if (res.conversation_id) {
        setConversationId(res.conversation_id);
      }

      const providerLabel = res.provider === 'groq' ? 'Groq Fast' : 'Gemini 3.5';
      setActiveProviderBadge(providerLabel);

      const assistantMsg = {
        id: res.message_id || `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        provider: res.provider,
        model: res.model,
        fallback_used: res.fallback_used,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      let errorReply = "I apologize, our assistant service is momentarily occupied. Please try again.";

      if (err.status === 401) {
        errorReply = "Your session has expired. Please log in again to continue.";
      } else if (
        err.status === 502 ||
        err.status === 504 ||
        (err.message && (err.message.includes('502') || err.message.includes('504') || err.message.includes('Failed to fetch')))
      ) {
        errorReply = "I am temporarily unable to reach the ZELORA core backend service. Please ensure the Django server is running on port 8000.";
      } else if (err.message) {
        errorReply = err.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: errorReply,
          provider: 'system',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    setConversationId(null);
    const firstName = activeUser?.first_name || activeUser?.name?.split(' ')[0] || 'Client';
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed. How may I assist you today, ${firstName}?`,
        provider: preferredProvider,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const toggleProvider = () => {
    const next = preferredProvider === 'gemini' ? 'groq' : 'gemini';
    setPreferredProvider(next);
    setActiveProviderBadge(next === 'groq' ? 'Groq Fast' : 'Gemini 3.5');
  };

  // Role-Aware Quick Suggestion Chips for Authenticated User
  const getSuggestions = () => {
    if (activeUser?.is_staff || activeUser?.role?.toLowerCase().includes('admin')) {
      return [
        "What is the total platform revenue?",
        "Show marketplace statistics",
        "How many pending approvals?",
        "How many users are registered?",
      ];
    }

    if (activeUser?.is_seller) {
      return [
        "What are my shop sales?",
        "How many units have I sold?",
        "Storefront status",
        "Latest orders for my shop",
      ];
    }

    // Default Authenticated Customer
    return [
      "Where is my order?",
      "How many orders have I placed?",
      "Is my payment successful?",
      "Show my saved addresses",
      "Recommend an evening gown",
    ];
  };

  return (
    <>
      {/* 1. Floating Logo Trigger Badge */}
      {!isOpen && (
        <button
          type="button"
          className="zelora-ai-trigger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open ZELORA Assistant"
          title="Open ZELORA Assistant"
        >
          <div className="zelora-ai-badge-crest">
            <span className="zelora-ai-crest-text">Z</span>
            <div className="zelora-ai-pulse-dot" />
          </div>
          <div className="zelora-ai-trigger-text">
            <span className="zelora-ai-trigger-label">ZELORA AI</span>
            <span className="zelora-ai-trigger-sub">Assistant</span>
          </div>
        </button>
      )}

      {/* 2. Floating AI Chat Window Drawer */}
      {isOpen && (
        <div className="zelora-ai-chat-window" role="dialog" aria-label="ZELORA Assistant">
          {/* Header */}
          <div className="zelora-ai-header">
            <div className="zelora-ai-header-left">
              <div className="zelora-ai-badge-crest" style={{ width: '32px', height: '32px' }}>
                <span className="zelora-ai-crest-text" style={{ fontSize: '11px' }}>Z</span>
              </div>
              <div className="zelora-ai-title-wrap">
                <h3>
                  ZELORA Assistant
                  <ShieldCheck size={13} color="#C6A664" />
                </h3>
                <button
                  type="button"
                  className="zelora-ai-provider-badge"
                  onClick={toggleProvider}
                  title="Click to switch AI Engine (Gemini / Groq)"
                  style={{ cursor: 'pointer', background: 'transparent', border: '1px solid rgba(198, 166, 100, 0.3)' }}
                >
                  <Zap size={9} color="#C6A664" />
                  <span>{activeProviderBadge}</span>
                </button>
              </div>
            </div>

            <div className="zelora-ai-header-actions">
              <button
                type="button"
                className="zelora-ai-icon-btn"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                className="zelora-ai-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close ZELORA Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream Area */}
          <div className="zelora-ai-messages-area">
            {messages.map((m) => (
              <div key={m.id} className={`zelora-ai-msg-row ${m.role}`}>
                <div className={`zelora-ai-msg-bubble ${m.role}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  {m.isAuthRequired && (
                    <div style={{ marginTop: '8px' }}>
                      <Link
                        to="/auth"
                        className="btn-admin-gold"
                        style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex' }}
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In Now
                      </Link>
                    </div>
                  )}
                  <div className="zelora-ai-msg-meta">
                    <span>{m.time}</span>
                    {m.provider && m.role === 'assistant' && (
                      <span>• {m.provider.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Typing Indicator */}
            {isLoading && (
              <div className="zelora-ai-msg-row assistant">
                <div className="zelora-ai-typing-indicator">
                  <div className="zelora-ai-typing-dot" />
                  <div className="zelora-ai-typing-dot" />
                  <div className="zelora-ai-typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="zelora-ai-suggestions-tray">
            {getSuggestions().map((sug, i) => (
              <button
                key={i}
                type="button"
                className="zelora-ai-chip"
                onClick={() => handleSend(sug)}
                disabled={isLoading}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            className="zelora-ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="zelora-ai-input"
              placeholder="Ask ZELORA Assistant about orders, styling, or boutique sales..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="zelora-ai-send-btn"
              disabled={!inputText.trim() || isLoading}
              title="Send message"
              aria-label="Send message"
            >
              <ArrowUp size={16} strokeWidth={2.6} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

