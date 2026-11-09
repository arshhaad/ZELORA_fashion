import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [preferredProvider, setPreferredProvider] = useState('gemini'); // 'gemini' | 'groq'
  const [activeProviderBadge, setActiveProviderBadge] = useState('Gemini 3.5');
  const [user, setUser] = useState(() => getActiveAuthUser());
  const messagesEndRef = useRef(null);

  // Sync active user when widget opens
  useEffect(() => {
    if (isOpen) {
      const active = getActiveAuthUser();
      setUser(active);

      // If no messages yet, seed with luxury personalized greeting
      if (messages.length === 0) {
        const firstName = active?.first_name || active?.name?.split(' ')[0] || (active?.email ? active.email.split('@')[0] : 'Guest');
        const role = active?.is_staff || active?.role?.toLowerCase().includes('admin')
          ? 'Administrator'
          : (active?.is_seller ? 'Boutique Seller' : 'Valued Client');

        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            content: active
              ? `Hi ${firstName}! 👋 Welcome to your private ZELORA Concierge. As a verified ${role}, how may I assist your wardrobe, orders, or atelier today?`
              : `Welcome to the ZELORA Luxury AI Concierge. Sign in to your account to review live order telemetry, track bespoke parcels, or query your boutique records.`,
            provider: 'gemini',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [isOpen]);

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
      const errorReply = err.status === 401
        ? "Your session has expired. Please log in again to continue."
        : (err.message || "I apologize, our concierge service is momentarily occupied. Please try again.");

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
    const active = getActiveAuthUser();
    const firstName = active?.first_name || active?.name?.split(' ')[0] || 'Client';
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

  // Role-Aware Quick Suggestion Chips
  const getSuggestions = () => {
    const active = user || getActiveAuthUser();
    if (!active) {
      return [
        "What is ZELORA?",
        "Recommend an evening look",
        "Sign in to track orders",
      ];
    }

    if (active.is_staff || active.role?.toLowerCase().includes('admin')) {
      return [
        "What is the total platform revenue?",
        "Show marketplace statistics",
        "How many pending approvals?",
        "How many users are registered?",
      ];
    }

    if (active.is_seller) {
      return [
        "What are my shop sales?",
        "How many units have I sold?",
        "Storefront status",
        "Latest orders for my shop",
      ];
    }

    // Default Customer
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
          aria-label="Open ZELORA Luxury AI Concierge"
          title="Open ZELORA Luxury AI Concierge"
        >
          <div className="zelora-ai-badge-crest">
            <span className="zelora-ai-crest-text">Z</span>
            <div className="zelora-ai-pulse-dot" />
          </div>
          <div className="zelora-ai-trigger-text">
            <span className="zelora-ai-trigger-label">ZELORA AI</span>
            <span className="zelora-ai-trigger-sub">Luxury Concierge</span>
          </div>
        </button>
      )}

      {/* 2. Floating AI Chat Window Drawer */}
      {isOpen && (
        <div className="zelora-ai-chat-window" role="dialog" aria-label="ZELORA AI Concierge">
          {/* Header */}
          <div className="zelora-ai-header">
            <div className="zelora-ai-header-left">
              <div className="zelora-ai-badge-crest" style={{ width: '32px', height: '32px' }}>
                <span className="zelora-ai-crest-text" style={{ fontSize: '11px' }}>Z</span>
              </div>
              <div className="zelora-ai-title-wrap">
                <h3>
                  ZELORA Concierge
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
                title="Close AI Concierge"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Guest Notice if unauthenticated */}
          {!user && (
            <div className="zelora-ai-guest-banner">
              <span>Sign in for order tracking & bespoke support:</span>
              <Link to="/auth" className="zelora-ai-guest-link" onClick={() => setIsOpen(false)}>
                Sign In →
              </Link>
            </div>
          )}

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
              placeholder="Ask about orders, styling, or boutique sales..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="zelora-ai-send-btn"
              disabled={!inputText.trim() || isLoading}
              title="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
