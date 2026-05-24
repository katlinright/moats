import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import {
  generateSeedPhrase,
  splitMnemonic,
  pickVerificationIndices,
  verifyWords,
} from '../../crypto/seed';
import { initDbKey } from '../../crypto/keys';
import { openDatabase, setOnboardingValue } from '../../db/queries';
import { useOnboardingStore } from '../../state/onboardingStore';

type Phase = 'display' | 'verify' | 'error';
type Props = NativeStackScreenProps<AppStackParamList, 'SeedPhrase'>;

export default function SeedPhraseScreen({ navigation }: Props) {
  const [mnemonic] = useState(() => generateSeedPhrase());
  const [phase, setPhase] = useState<Phase>('display');
  const [indices] = useState<[number, number, number]>(() => pickVerificationIndices());
  const [answers, setAnswers] = useState<[string, string, string]>(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  const setSeedVerified = useOnboardingStore((s) => s.setSeedVerified);
  const store = useOnboardingStore();

  const words = splitMnemonic(mnemonic);

  const setAnswer = useCallback((i: 0 | 1 | 2, val: string) => {
    setAnswers((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[i] = val;
      return next;
    });
  }, []);

  async function onVerify() {
    setVerifyError(false);
    if (!verifyWords(mnemonic, indices, answers)) {
      setVerifyError(true);
      setPhase('error');
      return;
    }

    setLoading(true);
    try {
      const key = await initDbKey(mnemonic);
      await openDatabase(key);

      const now = String(Math.floor(Date.now() / 1000));
      await setOnboardingValue('SEED_VERIFIED_AT', now);

      if (store.covenantHash) {
        await setOnboardingValue('COVENANT_HASH', store.covenantHash);
      }
      if (store.covenantAcceptedAt) {
        await setOnboardingValue('COVENANT_ACCEPTED_AT', String(Math.floor(store.covenantAcceptedAt / 1000)));
      }
      if (store.declarationReadAt) {
        await setOnboardingValue('DECLARATION_READ_AT', String(Math.floor(store.declarationReadAt / 1000)));
      }

      setSeedVerified();
      navigation.navigate('TwoQuestions');
    } finally {
      setLoading(false);
    }
  }

  if (phase === 'display') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Your Seed Phrase</Text>
          <Text style={styles.sub}>
            Write these 24 words in order in your physical journal. They are the only way to
            recover your account.
          </Text>
          <View style={styles.grid}>
            {words.map((word, i) => (
              <View key={i} style={styles.wordCell}>
                <Text style={styles.wordIndex}>{i + 1}</Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Never photograph, screenshot, or share these words.
            </Text>
          </View>
        </ScrollView>
        <Pressable style={styles.button} onPress={() => setPhase('verify')}>
          <Text style={styles.buttonText}>I have written them down</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Confirm Your Phrase</Text>
        <Text style={styles.sub}>Enter the words at the positions below.</Text>

        {(indices as number[]).map((idx, i) => (
          <View key={idx} style={styles.verifyRow}>
            <Text style={styles.verifyLabel}>Word #{idx + 1}</Text>
            <TextInput
              style={[styles.input, verifyError && styles.inputError]}
              value={answers[i as 0 | 1 | 2]}
              onChangeText={(v) => setAnswer(i as 0 | 1 | 2, v)}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="type word here"
              placeholderTextColor="#444"
            />
          </View>
        ))}

        {verifyError && (
          <Text style={styles.error}>One or more words are incorrect. Try again.</Text>
        )}
      </ScrollView>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={loading ? undefined : onVerify}
      >
        {loading ? (
          <ActivityIndicator color="#f5f5f5" />
        ) : (
          <Text style={styles.buttonText}>Confirm</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  content: { padding: 32, paddingTop: 64 },
  heading: {
    fontSize: 26,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sub: { fontSize: 14, color: '#888', fontWeight: '300', lineHeight: 22, marginBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordCell: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  wordIndex: { fontSize: 11, color: '#555', width: 20, textAlign: 'right' },
  wordText: { fontSize: 15, color: '#e0e0e0', fontWeight: '300', fontFamily: 'monospace' },
  warning: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1208',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#3a2a10',
  },
  warningText: { fontSize: 13, color: '#c8a060', fontWeight: '300', textAlign: 'center' },
  verifyRow: { marginBottom: 24 },
  verifyLabel: { fontSize: 13, color: '#666', marginBottom: 8 },
  input: {
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
    borderRadius: 4,
    padding: 14,
    fontSize: 16,
    color: '#f5f5f5',
    fontFamily: 'monospace',
  },
  inputError: { borderColor: '#5a1a1a' },
  error: { fontSize: 13, color: '#c86060', marginTop: 8 },
  button: {
    margin: 20,
    padding: 18,
    backgroundColor: '#1a2e3a',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#f5f5f5', fontSize: 15, fontWeight: '300', letterSpacing: 0.5 },
});
