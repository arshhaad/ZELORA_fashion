import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
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
  ChevronDown,
  Check
} from 'lucide-react';
import { aiApi, getActivePortalAuth } from '../../services/aiApi';
import zeloraAiLogo from '../../assets/zelora-tshirt-emblem.jpg';
import './aiChat.css';

export default function ZeloraAIChatWidget() {
  const { user: authUser } = useAuth();
  const { addToCart, showToast } = useCart();
  const location = useLocation();

  const [portalAuth, setPortalAuth] = useState(() => getActivePortalAuth(location.pathname));
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addingCartId, setAddingCartId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [preferredProvider, setPreferredProvider] = useState('groq'); // 'groq' | 'gemini'
  const [activeProviderBadge, setActiveProviderBadge] = useState('Groq Fast');
  const messagesEndRef = useRef(null);

  // Synchronize authenticated user state whenever route, storage, or auth context updates
  useEffect(() => {
    const checkAuth = () => {
      const current = getActivePortalAuth(location.pathname);
      setPortalAuth(current);
      if (!current.token || !current.user) {
        setIsOpen(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [authUser, location.pathname]);

  const activeUser = portalAuth.user;
  const activeToken = portalAuth.token;

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

  // Strictly do NOT render the AI assistant widget if the user is not logged in!
  if (!activeUser || !activeToken) {
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

    const token = activeToken;
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
        products: res.products || [],
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

  const handleAddToCart = (e, prod) => {
    e.stopPropagation();
    try {
      const cartItem = {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        originalPrice: prod.original_price || prod.price,
        category: prod.category,
        brand: prod.brand || 'ZELORA Atelier',
        images: [prod.image],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [{ name: 'Noir Black', hex: '#0a0a0a' }],
        inStock: prod.in_stock,
      };
      const res = addToCart(cartItem, 'M', 'Noir Black', 1);
      if (res !== false) {
        setAddingCartId(prod.id);
        if (showToast) {
          showToast(`Added "${prod.name}" to your shopping bag.`, 'success');
        }
        setTimeout(() => {
          setAddingCartId(null);
        }, 2200);
      }
    } catch (err) {
      console.error('Error adding to cart from AI Concierge:', err);
    }
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
            <img
              src={zeloraAiLogo}
              alt="ZELORA AI"
              className="zelora-ai-crest-img"
            />
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
              <div className="zelora-ai-badge-crest" style={{ width: '34px', height: '34px' }}>
                <img
                  src={zeloraAiLogo}
                  alt="ZELORA AI"
                  className="zelora-ai-crest-img"
                />
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

                  {/* Interactive Product Recommendation Cards with Photos */}
                  {m.products && m.products.length > 0 && (
                    <div className="zelora-ai-products-strip">
                      {m.products.map((prod) => (
                        <div key={prod.id} className="zelora-ai-product-card">
                          <div className="zelora-ai-prod-img-wrap">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80&sat=-100';
                              }}
                            />
                            {prod.category && (
                              <span className="zelora-ai-prod-category">{prod.category}</span>
                            )}
                            {!prod.in_stock && (
                              <span className="zelora-ai-prod-soldout">Unavailable</span>
                            )}
                          </div>
                          <div className="zelora-ai-prod-body">
                            <div className="zelora-ai-prod-meta-row">
                              {prod.brand && (
                                <span className="zelora-ai-prod-brand">{prod.brand}</span>
                              )}
                              {prod.rating && (
                                <span className="zelora-ai-prod-rating">★ {prod.rating}</span>
                              )}
                            </div>
                            <h4 className="zelora-ai-prod-title" title={prod.name}>
                              {prod.name}
                            </h4>
                            {prod.description && (
                              <p className="zelora-ai-prod-desc" title={prod.description}>
                                {prod.description}
                              </p>
                            )}
                            <div className="zelora-ai-prod-price-row">
                              <span className="zelora-ai-prod-price">₹{prod.price}</span>
                              {prod.original_price && prod.original_price > prod.price && (
                                <span className="zelora-ai-prod-orig-price">₹{prod.original_price}</span>
                              )}
                            </div>
                            <div className="zelora-ai-prod-actions-row">
                              <Link
                                to={`/products/${prod.id}`}
                                className="zelora-ai-prod-action-btn view"
                                onClick={() => setIsOpen(false)}
                                title="View Product Details"
                              >
                                <span>View Piece</span>
                                <ExternalLink size={11} />
                              </Link>
                              {prod.in_stock ? (
                                <button
                                  type="button"
                                  className={`zelora-ai-prod-action-btn cart ${addingCartId === prod.id ? 'added' : ''}`}
                                  onClick={(e) => handleAddToCart(e, prod)}
                                  disabled={addingCartId === prod.id}
                                  title="Add to Shopping Bag"
                                >
                                  {addingCartId === prod.id ? (
                                    <>
                                      <Check size={11} />
                                      <span>Added ✓</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag size={11} />
                                      <span>Add to Cart</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="zelora-ai-prod-action-btn cart disabled"
                                  disabled
                                  title="Item is currently out of stock"
                                >
                                  <span>Out of Stock</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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

