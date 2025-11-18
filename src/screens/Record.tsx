import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Mic, Square, Loader2, Play, Pause, CheckCircle } from 'lucide-react-native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import Dropdown from '../components/atoms/Dropdown';
import RoundedButton from '../components/atoms/RoundedButton';
import { useExpenses } from '../hooks/useExpenses';
import { PROCESS_VOICE_EXPENSE } from '../queries/mutations/Expenses/ProcessVoiceExpense';
import { CONFIRM_VOICE_TRANSACTION } from '../queries/mutations/Expenses/ConfirmVoiceTransaction';
import { GETEXPENSES } from '../queries/GetExpenses';
import { GETEXPENSE } from '../queries/GetExpense';

type AudioMessage = {
  id: string;
  type: 'audio';
  expenseId: string;
  uri: string;
  durationMs: number;
  status: 'processing' | 'done' | 'error';
  error?: string;
  recordedAt: number;
};

type SystemMessage = {
  id: string;
  type: 'system';
  expenseId: string;
  title: string;
  amount: number;
  suggestedCategoryId?: string | null;
  suggestedCategoryName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  transactionId?: string;
  confirming?: boolean;
  rejected?: boolean;
  titleInput: string;
  amountInput: string;
  recordedAt: number;
};

type VoiceMessage = AudioMessage | SystemMessage;

function formatDuration(ms: number) {
  if (!ms) return '0:00';
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(1, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function Record() {
  const navigation = useNavigation<any>();
  const recorder = useRef(new AudioRecorderPlayer()).current;
  const listRef = useRef<FlatList<VoiceMessage>>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'en' | 'de'>('auto');

  const { expensesQuery, categoriesQuery } = useExpenses({ includeCategories: true });
  const expenses = expensesQuery.data?.getExpenses ?? [];
  const categories = categoriesQuery?.data?.getExpenseCategories ?? [];
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedExpenseId && expenses.length) {
      setSelectedExpenseId(expenses[0].id);
    }
  }, [expenses, selectedExpenseId]);

  const selectedExpense = useMemo(
    () => expenses.find(e => e.id === selectedExpenseId),
    [expenses, selectedExpenseId],
  );

  const [processVoiceMutation, { loading: isProcessingVoice }] = useMutation(
    PROCESS_VOICE_EXPENSE,
  );
  const [confirmVoiceMutation] = useMutation(CONFIRM_VOICE_TRANSACTION);

  // Cleanup recorder on unmount
  useEffect(() => {
    return () => {
      recorder.stopRecorder().catch(() => {});
      recorder.removeRecordBackListener();
      recorder.stopPlayer().catch(() => {});
      recorder.removePlayBackListener();
    };
  }, [recorder]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'FinanZ needs access to your microphone to record expenses.',
        buttonPositive: 'Allow',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const startRecording = async () => {
    if (!selectedExpenseId) {
      Alert.alert('Select an expense', 'Please choose an expense before recording.');
      return;
    }
    const allowed = await requestMicrophonePermission();
    if (!allowed) {
      Alert.alert('Permission required', 'Microphone access is needed to record audio.');
      return;
    }
    try {
      setRecordDuration(0);
      setIsRecording(true);
      await recorder.startRecorder();
      recorder.addRecordBackListener(e => {
        setRecordDuration(Math.floor(e.current_position));
        return;
      });
    } catch (error) {
      console.error('Failed to start recording', error);
      setIsRecording(false);
      Alert.alert('Recording failed', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      const uri = await recorder.stopRecorder();
      recorder.removeRecordBackListener();
      setIsRecording(false);
      if (uri) {
        void handleProcessUpload(uri, recordDuration, selectedExpenseId as string);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      setIsRecording(false);
    }
  };

  const handleProcessUpload = async (
    uri: string,
    durationMs: number,
    expenseId: string,
  ) => {
    const audioId = `audio-${Date.now()}`;
    const recordedAt = Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: audioId,
        type: 'audio',
        expenseId,
        uri,
        durationMs,
        status: 'processing',
        recordedAt,
      },
    ]);
    setIsProcessingUpload(true);
    try {
      const file = {
        uri,
        name: `voice-${Date.now()}.m4a`,
        type: 'audio/m4a',
      } as const;
      const { data } = await processVoiceMutation({
        variables: {
          expenseId,
          file,
          language: selectedLanguage === 'auto' ? undefined : selectedLanguage,
        },
      });
      const result = data?.processVoiceExpense;
      setMessages(prev => {
        const updated = prev.map(msg =>
          msg.id === audioId && msg.type === 'audio'
            ? { ...msg, status: 'done' }
            : msg,
        );
        if (!result) return updated;
        return [
          ...updated,
          {
            id: result.id,
            type: 'system',
            expenseId,
            title: result.title,
            amount: result.amount,
            suggestedCategoryId: result.suggestedCategoryId ?? null,
            suggestedCategoryName: result.suggestedCategoryName ?? null,
            categoryId: result.suggestedCategoryId ?? null,
            categoryName: result.suggestedCategoryName ?? null,
            titleInput: result.title,
            amountInput: `${result.amount}`,
            recordedAt,
          },
        ];
      });
    } catch (error: any) {
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error?.message === 'string'
          ? error.message
          : 'Upload failed';
      console.error('processVoiceExpense failed', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === audioId && msg.type === 'audio'
            ? {
                ...msg,
                status: 'error',
                error: errMsg,
              }
            : msg,
        ),
      );
      Alert.alert(
        'Processing failed',
        errMsg || 'Unable to process the recording. Please try again.',
      );
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const confirmTransaction = async (message: SystemMessage) => {
    if (message.transactionId) return;
    setMessages(prev =>
      prev.map(m =>
        m.id === message.id && m.type === 'system' ? { ...m, confirming: true } : m,
      ),
    );
    try {
      const { data } = await confirmVoiceMutation({
        variables: {
          expenseId: message.expenseId,
          title: message.title,
          amount: message.amount,
          categoryId: message.suggestedCategoryId ?? null,
        },
        refetchQueries: [
          { query: GETEXPENSES },
          { query: GETEXPENSE, variables: { id: message.expenseId } },
        ],
        awaitRefetchQueries: true,
      });
      const tx = data?.confirmVoiceTransaction;
      if (tx?.id) {
        setMessages(prev =>
          prev.map(m =>
            m.id === message.id && m.type === 'system'
              ? { ...m, transactionId: tx.id, confirming: false }
              : m,
          ),
        );
      } else {
        throw new Error('No transaction returned');
      }
    } catch (error: any) {
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error?.message === 'string'
          ? error.message
          : 'Saving the transaction failed. Please try again.';
      console.error('confirmVoiceTransaction failed', error);
      Alert.alert('Could not confirm', errMsg);
      setMessages(prev =>
        prev.map(m =>
          m.id === message.id && m.type === 'system'
            ? { ...m, confirming: false }
            : m,
        ),
      );
    }
  };

  const togglePlayback = async (message: AudioMessage) => {
    try {
      if (playingId === message.id) {
        await recorder.stopPlayer();
        recorder.removePlayBackListener();
        setPlayingId(null);
        return;
      }
      await recorder.stopPlayer();
      recorder.removePlayBackListener();
      setPlayingId(message.id);
      await recorder.startPlayer(message.uri);
      recorder.addPlayBackListener(e => {
        if (e.currentPosition >= e.duration) {
          recorder.stopPlayer().catch(() => {});
          recorder.removePlayBackListener();
          setPlayingId(null);
        }
        return;
      });
    } catch (error: any) {
      console.error('Playback failed', error);
      setPlayingId(null);
    }
  };

  const filteredMessages = useMemo(
    () => messages.filter(m => !!m && m.expenseId === selectedExpenseId),
    [messages, selectedExpenseId],
  );

  const scrollToBottom = () => {
    try {
      listRef.current?.scrollToEnd({ animated: true });
    } catch {}
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const rejectMessage = (message: SystemMessage) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === message.id && m.type === 'system'
          ? { ...m, rejected: true }
          : m,
      ),
    );
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const navigateToTransaction = (message: SystemMessage) => {
    if (!message.transactionId) return;
    navigation.navigate('ExpensesTab', {
      screen: 'ExpenseTransactions',
      params: { expenseId: message.expenseId, openTransactionId: message.transactionId },
    });
  };

  const renderMessage = ({ item }: ListRenderItemInfo<VoiceMessage>) => {
    if (!item) return null;
    if (item.type === 'audio') {
      return (
        <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
          <View
            style={[
              styles.audioBubble,
              item.status === 'error' && styles.errorBubble,
            ]}
          >
            <View style={styles.bubbleHeader}>
              <Mic color="#a5b4fc" size={18} />
              <Text style={styles.bubbleTitle}>Voice note</Text>
            </View>
            <View style={styles.voiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bubbleBody}>{formatDuration(item.durationMs || 0)}</Text>
                <Text style={styles.metaText}>{formatTimestamp(item.recordedAt)}</Text>
              </View>
              {item.status === 'processing' ? (
                <View style={[styles.bubbleFooterRow, { marginTop: 0 }]}>
                  <Loader2 color="#fbbf24" size={14} />
                  <Text style={styles.bubbleHint}>Processing...</Text>
                </View>
              ) : item.status === 'error' ? (
                <Text style={[styles.bubbleHint, { color: '#fca5a5' }]}> {item.error ?? 'Upload failed'} </Text>
              ) : (
                <TouchableOpacity
                  onPress={() => togglePlayback(item)}
                  style={styles.playButton}
                  activeOpacity={0.8}
                >
                  {playingId === item.id ? (
                    <Pause color="#0f172a" size={16} />
                  ) : (
                    <Play color="#0f172a" size={16} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }

    const currency = selectedExpense?.currency ? ` ${selectedExpense.currency}` : '';
    const finalized = item.transactionId || item.rejected;
    const statusStyle = item.transactionId
      ? styles.successBubble
      : item.rejected
      ? styles.rejectedBubble
      : null;

    // Condensed pill when finalized
    if (finalized) {
      return (
        <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.slimPill, statusStyle]}
            onPress={() => {
              if (item.transactionId) navigateToTransaction(item);
            }}
          >
            {item.transactionId ? (
              <CheckCircle color="#22c55e" size={14} />
            ) : (
              <Pause color="#f87171" size={14} />
            )}
            <Text style={styles.slimText}>{item.titleInput || item.title}</Text>
            <Text style={[styles.slimText, { color: '#a5b4fc' }]}>
              {Number(item.amountInput || item.amount || 0).toLocaleString()}
              {currency}
            </Text>
            {item.categoryName ? (
              <Text style={[styles.slimText, { color: '#cbd5e1' }]}>
                {item.categoryName}
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
        <View style={[styles.systemBubble, statusStyle]}>
          <Text style={styles.label}>Detected</Text>
          <TextInput
            style={styles.editInput}
            value={item.titleInput}
            onChangeText={text =>
              setMessages(prev =>
                prev.map(m =>
                  m.id === item.id && m.type === 'system'
                    ? { ...m, titleInput: text }
                    : m,
                ),
              )
            }
            selectTextOnFocus
            placeholder="Title"
            placeholderTextColor="#64748b"
          />
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.editInput, { flex: 1 }]}
              value={item.amountInput}
              onChangeText={text =>
                setMessages(prev =>
                  prev.map(m =>
                    m.id === item.id && m.type === 'system'
                      ? { ...m, amountInput: text }
                      : m,
                  ),
                )
              }
              keyboardType="decimal-pad"
              selectTextOnFocus
              placeholder="Amount"
              placeholderTextColor="#64748b"
            />
            {currency ? <Text style={styles.currency}>{currency}</Text> : null}
          </View>
          {categories.length ? (
            <Dropdown
              label="Category"
              value={item.categoryId || ''}
              options={categories.map((c: any) => ({
                id: c.id,
                label: c.name,
                color: c.color,
              }))}
              onSelect={opt =>
                setMessages(prev =>
                  prev.map(m =>
                    m.id === item.id && m.type === 'system'
                      ? { ...m, categoryId: opt.id || null, categoryName: opt.label || null }
                      : m,
                  ),
                )
              }
              placeholder="Select category"
            />
          ) : null}
            <Text style={styles.metaText}>{formatTimestamp(item.recordedAt)}</Text>

          <View style={styles.actionRow}>
            <RoundedButton
              title="Reject"
              onPress={() => rejectMessage(item)}
              variant="danger"
              disabled={!!item.confirming}
              size="sm"
              style={{ flex: 1 }}
            />
            <RoundedButton
              title={item.confirming ? 'Saving...' : 'Confirm'}
              onPress={() => confirmTransaction(item)}
              disabled={!!item.confirming || item.rejected}
              loading={!!item.confirming}
              size="sm"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper scrollable={false} backgroundColor="#0e0f14">
      <View style={styles.container}>
        <Text style={styles.title}>Record expense</Text>
        <View style={styles.rowSelects}>
          <View style={{ flex: 2, marginRight: 8 }}>
            <Dropdown
              label="Expense"
              value={selectedExpenseId}
              options={expenses.map((e: any) => ({
                id: e.id,
                label: e.title,
                color: '#22c55e',
              }))}
              onSelect={opt => setSelectedExpenseId(opt.id || null)}
              loading={expensesQuery.loading}
              placeholder="Select an expense"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Dropdown
              label="Language"
              value={selectedLanguage}
              options={[
                { id: 'auto', label: 'Auto' },
                { id: 'en', label: 'English' },
                { id: 'de', label: 'Deutsch' },
              ]}
              onSelect={opt => setSelectedLanguage((opt.id as any) || 'auto')}
              placeholder="Auto"
            />
          </View>
        </View>

        {!expenses.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySub}>
              Create an expense first, then come back to record a transaction.
            </Text>
            <RoundedButton
              title="Go to Expenses"
              onPress={() => navigation.navigate('ExpensesTab')}
              fullWidth
            />
          </View>
        ) : (
          <>
            <FlatList
              data={filteredMessages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              ref={listRef}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptySub}>
                    Record a voice note to create your first transaction here.
                  </Text>
                </View>
              }
            />

            <View style={styles.recordBar}>
              <View>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>
                  {isRecording
                    ? `Recording... ${formatDuration(recordDuration)}`
                    : isProcessingVoice || isProcessingUpload
                    ? 'Processing recording...'
                    : 'Ready'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.recordButton,
                  isRecording && styles.recording,
                  (!selectedExpenseId || isProcessingVoice || isProcessingUpload) &&
                    styles.recordDisabled,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={!selectedExpenseId || isProcessingVoice || isProcessingUpload}
              >
                {isRecording ? (
                  <Square color="#fff" size={28} />
                ) : (
                  <Mic color="#fff" size={28} />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  audioBubble: {
    maxWidth: '82%',
    minWidth: '60%',
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
    borderTopRightRadius: 2,
  },
  systemBubble: {
    maxWidth: '85%',
    minWidth: '60%',
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 10,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  errorBubble: {
    borderColor: '#f87171',
    backgroundColor: '#1f2937',
  },
  successBubble: {
    borderColor: '#22c55e',
    backgroundColor: '#0f1f14',
  },
  rejectedBubble: {
    borderColor: '#f87171',
    backgroundColor: '#2b0f13',
  },
  condensedBubble: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: '60%',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  bubbleTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  bubbleBody: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  metaText: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  bubbleHint: {
    color: '#eab308',
    fontSize: 12,
    marginLeft: 6,
  },
  bubbleFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    },
  playButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#e5e7eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: '#e2e8f0',
    fontSize: 14,
    marginTop: 2,
  },
  suggestion: {
    color: '#a5b4fc',
    marginTop: 6,
    fontSize: 13,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#e2e8f0',
    backgroundColor: '#0b1220',
    marginTop: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  currency: { color: '#cbd5e1', fontWeight: '700' },
  pill: {
    marginTop: 10,
    backgroundColor: '#0b1424',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  pillText: {
    color: '#e2e8f0',
    fontWeight: '700',
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  slimPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  slimText: { color: '#e2e8f0', fontWeight: '700', fontSize: 13 },
  rowSelects: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  recording: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  recordDisabled: {
    opacity: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyList: {
    alignItems: 'center',
    marginTop: 40,
  },
});
