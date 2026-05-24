import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Crypto from 'expo-crypto';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../state/onboardingStore';

const CLAUSES = [
  'Speak from the I.',
  'Witness without agenda.',
  'Keep what is said here inside.',
];

export const COVENANT_TEXT = CLAUSES.join('\n');
const HOLD_MS = 1500;

type Props = NativeStackScreenProps<AppStackParamList, 'Covenant'>;

function CovenantClause({
  text,
  accepted,
  onAccepted,
}: {
  text: string;
  accepted: boolean;
  onAccepted: () => void;
}) {
  const progress = useSharedValue(0);

  const gesture = Gesture.LongPress()
    .minDuration(HOLD_MS)
    .onBegin(() => {
      progress.value = withTiming(1, { duration: HOLD_MS });
    })
    .onStart(() => {
      runOnJS(onAccepted)();
    })
    .onFinalize((_event, success) => {
      if (!success) {
        progress.value = withTiming(0, { duration: 200 });
      }
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.clause, accepted && styles.clauseAccepted]}>
        <Text style={[styles.clauseText, accepted && styles.clauseTextAccepted]}>{text}</Text>
        {accepted ? (
          <Text style={styles.check}>✓</Text>
        ) : (
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

export default function CovenantScreen({ navigation }: Props) {
  const [accepted, setAccepted] = useState([false, false, false]);
  const setCovenant = useOnboardingStore((s) => s.setCovenant);
  const allAccepted = accepted.every(Boolean);

  function accept(index: number) {
    setAccepted((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }

  async function onContinue() {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      COVENANT_TEXT,
    );
    setCovenant(hash);
    navigation.navigate('SeedPhrase');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>The Covenant</Text>
      <Text style={styles.sub}>Hold each clause to accept.</Text>

      {CLAUSES.map((clause, i) => (
        <CovenantClause key={i} text={clause} accepted={accepted[i]} onAccepted={() => accept(i)} />
      ))}

      <View style={styles.spacer} />

      {allAccepted && (
        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 32, paddingTop: 64 },
  heading: {
    fontSize: 26,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sub: { fontSize: 14, color: '#666', marginBottom: 40, fontWeight: '300' },
  clause: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
    borderRadius: 4,
    padding: 20,
    marginBottom: 12,
  },
  clauseAccepted: { borderColor: '#1a3a4a', backgroundColor: '#0d1f28' },
  clauseText: { fontSize: 17, color: '#c8c8c8', fontWeight: '300', marginBottom: 12 },
  clauseTextAccepted: { color: '#7eb8d4' },
  track: {
    height: 2,
    backgroundColor: '#1e1e1e',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#7eb8d4' },
  check: { fontSize: 16, color: '#7eb8d4' },
  spacer: { flex: 1 },
  button: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#1a2e3a',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: { color: '#f5f5f5', fontSize: 15, fontWeight: '300', letterSpacing: 0.5 },
});
