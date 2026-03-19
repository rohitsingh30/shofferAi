import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { executeAgent, sendInput, SSEEvent } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { MessageBubble } from '../../components/MessageBubble';
import { TaskProgress, StepInfo } from '../../components/TaskProgress';
import { InputPrompt } from '../../components/InputPrompt';
import { SuggestionCards } from '../../components/SuggestionChips';
import { TypingIndicator } from '../../components/TypingIndicator';
import { CartSummary } from '../../components/CartSummary';
import { PaymentSheet } from '../../components/PaymentSheet';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

interface PendingInput {
  taskId: string;
  stepId: string;
  question: string;
  inputType: 'text' | 'otp' | 'confirmation' | 'choice' | 'freetext';
  options?: string[];
}

interface CartItem { name: string; quantity: number; price?: number }
interface PaymentData { taskId: string; bookingSummary: string; amountCents: number }

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [pendingInput, setPendingInput] = useState<PendingInput | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartStore, setCartStore] = useState('');
  const [cartTotal, setCartTotal] = useState<number | undefined>();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const abortRef = useRef<AbortController | null>(null);
  const msgIdRef = useRef(0);

  const scrollToEnd = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    const { type, payload } = event;
    switch (type) {
      case 'message': {
        const content = payload.content as string;
        const streaming = payload.streaming as boolean;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.streaming) {
            return [...prev.slice(0, -1), { ...last, content, streaming }];
          }
          return [...prev, { id: `msg-${++msgIdRef.current}`, role: 'assistant', content, streaming }];
        });
        scrollToEnd();
        break;
      }
      case 'step_update': {
        const action = payload.action as string;
        const status = payload.status as StepInfo['status'];
        const id = (payload.id as string) || `step-${Date.now()}`;
        if (status === 'cart_update' || (payload as Record<string, unknown>).cartItems) {
          const items = (payload as Record<string, unknown>).cartItems as CartItem[] | undefined;
          if (items) {
            setCartItems(items);
            setCartStore((payload as Record<string, unknown>).store as string || 'Store');
            setCartTotal((payload as Record<string, unknown>).total as number | undefined);
          }
        }
        setSteps((prev) => {
          const existing = prev.find((s) => s.id === id);
          if (existing) return prev.map((s) => (s.id === id ? { ...s, status } : s));
          return [...prev, { id, action, status }];
        });
        scrollToEnd();
        break;
      }
      case 'cart_update': {
        const items = payload.items as CartItem[] | undefined;
        if (items) {
          setCartItems(items);
          setCartStore(payload.store as string || 'Store');
          setCartTotal(payload.total as number | undefined);
        }
        scrollToEnd();
        break;
      }
      case 'input_required': {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPendingInput({
          taskId: payload.taskId as string,
          stepId: payload.stepId as string,
          question: payload.question as string,
          inputType: (payload.inputType as PendingInput['inputType']) || 'text',
          options: payload.options as string[] | undefined,
        });
        scrollToEnd();
        break;
      }
      case 'payment_required': {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPayment({
          taskId: payload.taskId as string,
          bookingSummary: payload.bookingSummary as string,
          amountCents: payload.amountCents as number,
        });
        break;
      }
      case 'complete': {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsLoading(false);
        setSteps([]);
        setCartItems([]);
        break;
      }
      case 'error': {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setMessages((prev) => [
          ...prev,
          { id: `msg-${++msgIdRef.current}`, role: 'assistant', content: `Something went wrong: ${payload.error || 'Unknown error'}` },
        ]);
        setIsLoading(false);
        setSteps([]);
        break;
      }
    }
  }, []);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInput('');
    setIsLoading(true);
    setSteps([]);
    setPendingInput(null);
    setCartItems([]);
    setMessages((prev) => [...prev, { id: `msg-${++msgIdRef.current}`, role: 'user', content: msg }]);
    scrollToEnd();
    try {
      const abort = new AbortController();
      abortRef.current = abort;
      await executeAgent(msg, handleSSEEvent, abort.signal);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { id: `msg-${++msgIdRef.current}`, role: 'assistant', content: e.message || 'Connection lost. Please try again.' },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputResponse = async (value: string) => {
    if (!pendingInput) return;
    setPendingInput(null);
    try {
      await sendInput(pendingInput.taskId, pendingInput.stepId, value);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `msg-${++msgIdRef.current}`, role: 'assistant', content: 'Failed to send your response. Please try again.' },
      ]);
    }
  };

  const isEmpty = messages.length === 0;
  const firstName = user?.name?.split(' ')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#7c5cfc', '#a78bfa']}
            style={styles.headerLogo}
          >
            <Text style={styles.headerLogoText}>S</Text>
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>ShofferAI</Text>
            {isLoading ? (
              <View style={styles.statusRow}>
                <View style={styles.statusPulse} />
                <Text style={styles.statusActive}>Working...</Text>
              </View>
            ) : (
              <Text style={styles.statusIdle}>Ready to help</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => {
            if (abortRef.current) abortRef.current.abort();
            setMessages([]);
            setInput('');
            setSteps([]);
            setPendingInput(null);
            setCartItems([]);
            setCartStore('');
            setCartTotal(undefined);
            setPayment(null);
            setIsLoading(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="create-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Messages or Empty state */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <LinearGradient
              colors={['#7c5cfc', '#ec4899']}
              style={styles.emptyLogo}
            >
              <Ionicons name="flash" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>
              {firstName ? `Hey ${firstName}!` : 'Hey!'}
            </Text>
            <Text style={styles.emptySubtitle}>
              I execute real tasks on real websites.{'\n'}
              What should I do for you?
            </Text>
          </View>
          <SuggestionCards onSelect={handleSend} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={
            <>
              {isLoading && steps.length === 0 && !pendingInput && <TypingIndicator />}
              {steps.length > 0 && <TaskProgress steps={steps} />}
              {cartItems.length > 0 && (
                <CartSummary store={cartStore} items={cartItems} total={cartTotal} />
              )}
              {pendingInput && (
                <InputPrompt
                  question={pendingInput.question}
                  inputType={pendingInput.inputType}
                  options={pendingInput.options}
                  onSubmit={handleInputResponse}
                />
              )}
            </>
          }
          onContentSizeChange={scrollToEnd}
        />
      )}

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputArea}>
          <View style={[styles.inputRow, inputFocused && styles.inputRowFocused]}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Message ShofferAI..."
              placeholderTextColor={colors.tertiary}
              multiline
              maxLength={2000}
              editable={!isLoading}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                input.trim() && !isLoading && styles.sendBtnActive,
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={input.trim() && !isLoading ? '#fff' : colors.tertiary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            ShofferAI browses real websites and executes real actions on your behalf.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Payment modal */}
      <Modal
        visible={!!payment}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPayment(null)}
      >
        {payment && (
          <View style={styles.paymentModal}>
            <PaymentSheet
              taskId={payment.taskId}
              bookingSummary={payment.bookingSummary}
              amountCents={payment.amountCents}
              onClose={() => setPayment(null)}
              onSuccess={() => {
                setPayment(null);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  headerTitle: { color: colors.foreground, fontSize: fontSize.lg, fontWeight: '700', letterSpacing: -0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  statusPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusActive: { color: colors.success, fontSize: fontSize.xs },
  statusIdle: { color: colors.tertiary, fontSize: fontSize.xs, marginTop: 1 },
  newChatBtn: { padding: spacing.sm },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'space-between', paddingTop: 60 },
  emptyContent: { alignItems: 'center', paddingHorizontal: spacing['3xl'] },
  emptyLogo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.tertiary,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Messages
  messageList: { paddingVertical: spacing.lg, flexGrow: 1 },

  // Input
  inputArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 16,
    paddingRight: 5,
    paddingVertical: 5,
    gap: spacing.sm,
  },
  inputRowFocused: { borderColor: colors.primaryBorder },
  textInput: {
    flex: 1,
    color: colors.foreground,
    fontSize: fontSize.base,
    maxHeight: 100,
    paddingVertical: 8,
    lineHeight: 20,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  disclaimer: {
    color: colors.tertiary,
    fontSize: fontSize['2xs'],
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
    opacity: 0.5,
  },

  // Payment modal
  paymentModal: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'flex-end',
  },
});
