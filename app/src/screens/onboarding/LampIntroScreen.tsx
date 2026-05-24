import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { markOnboardingComplete } from '../../crypto/keys';
import { setOnboardingValue } from '../../db/queries';
import { useOnboardingStore } from '../../state/onboardingStore';

type Props = NativeStackScreenProps<AppStackParamList, 'LampIntro'>;

export default function LampIntroScreen({ navigation }: Props) {
  const setComplete = useOnboardingStore((s) => s.setComplete);

  async function onContinue() {
    const now = String(Math.floor(Date.now() / 1000));
    await setOnboardingValue('ONBOARDING_COMPLETE', now);
    await markOnboardingComplete();
    setComplete();
    navigation.replace('MoatPlaceholder');
  }

  return (
    <View style={styles.container}>
      <View style={styles.lampDemo}>
        <Text style={styles.lampIcon}>🪔</Text>
      </View>

      <Text style={styles.heading}>The Lamp</Text>

      <Text style={styles.body}>
        The lamp is always in the corner of your screen. It never badges. It never pulses.
      </Text>

      <Text style={styles.body}>
        Tapping it opens a list of crisis resources for your country — helplines, support lines,
        emergency services.
      </Text>

      <Text style={styles.body}>
        These resources work offline. Nothing about how you use the lamp is ever recorded.
      </Text>

      <View style={styles.spacer} />

      <Pressable style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Enter Moatly</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 32,
    paddingTop: 80,
  },
  lampDemo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0d1f28',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  lampIcon: { fontSize: 30 },
  heading: {
    fontSize: 26,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 1,
    marginBottom: 28,
  },
  body: {
    fontSize: 16,
    color: '#c8c8c8',
    fontWeight: '300',
    lineHeight: 26,
    marginBottom: 20,
  },
  spacer: { flex: 1 },
  button: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#1a2e3a',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: { color: '#f5f5f5', fontSize: 15, fontWeight: '300', letterSpacing: 1 },
});
