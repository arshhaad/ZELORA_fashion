// ZELORA Mobile Luxury AI Concierge Screen
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { aiApi } from '../../api/aiApi';
import { useAuth } from '../../context/AuthContext';

const QUICK_PROMPTS = [
  'Where is my latest order?',
  'Suggest black evening dresses under ₹5,000',
  'What is the bespoke return policy?',
  'Recommend tailored winter overcoats',
];

export const AIChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const firstName = user?.first_name || 'Client';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to ZELORA AI Concierge, ${firstName}. How may I assist your wardrobe styling, size selection, or order status today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'ZELORA NOIR',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const sendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await aiApi.sendMessage({
        message: query,
        conversation_id: conversationId,
        preferred_provider: 'gemini',
      });

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.reply || 'I am at your service.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.provider || 'AI ATELIER',
        products: response.products || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          err.status === 401
            ? 'Your session has expired. Please sign in to your client account.'
            : err.message || 'The concierge service is momentarily occupied. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'SYSTEM',
        isAuthRequired: err.status === 401,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header navigation={navigation} title="AI CONCIERGE" showBack showAI={false} />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.role === 'user';
          return (
            <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
              <View style={[styles.msgBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.msgText, isUser ? styles.userText : styles.assistantText]}>
                  {item.content}
                </Text>

                {/* Embedded Products Cards */}
                {item.products && item.products.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsStrip}>
                    {item.products.map((prod) => (
                      <TouchableOpacity
                        key={prod.id}
                        style={styles.miniProdCard}
                        onPress={() => navigation.navigate('ProductDetail', { product: prod })}
                      >
                        <Image
                          source={{ uri: prod.image }}
                          style={styles.miniProdImg}
                          resizeMode="cover"
                        />
                        <View style={styles.miniProdBody}>
                          <Text style={styles.miniProdName} numberOfLines={1}>
                            {prod.name}
                          </Text>
                          <Text style={styles.miniProdPrice}>₹{prod.price}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {item.isAuthRequired && (
                  <TouchableOpacity
                    style={styles.signInBtn}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.signInBtnText}>SIGN IN TO CONTINUE</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.metaRow}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  {item.provider && !isUser && (
                    <Text style={styles.providerText}>• {item.provider.toUpperCase()}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={colors.goldBright} />
              <Text style={styles.typingText}>Consulting ZELORA Atelier intelligence...</Text>
            </View>
          ) : null
        }
      />

      {/* Quick Prompts Strip */}
      <View style={styles.promptsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => sendMessage(prompt)}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Field Bar */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask ZELORA Assistant about styling, sizes, or orders..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Feather name="arrow-up" size={18} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 2,
  },
  userBubble: {
    backgroundColor: colors.goldDark,
    borderColor: colors.gold,
    borderWidth: 1,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: colors.textPrimary,
  },
  assistantText: {
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  providerText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productsStrip: {
    marginTop: 10,
    marginBottom: 4,
  },
  miniProdCard: {
    width: 140,
    marginRight: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniProdImg: {
    width: '100%',
    height: 100,
  },
  miniProdBody: {
    padding: 6,
  },
  miniProdName: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  miniProdPrice: {
    color: colors.goldBright,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  signInBtn: {
    backgroundColor: colors.goldBright,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  signInBtnText: {
    ...typography.buttonText,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '800',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    color: colors.goldBright,
    fontSize: 11,
    fontStyle: 'italic',
  },
  promptsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  promptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptChip: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderHighlight,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptChipText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 13,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
