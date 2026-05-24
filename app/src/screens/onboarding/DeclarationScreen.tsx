import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../state/onboardingStore';

const RIGHTS = [
  'I have the right to speak truthfully about my own experience.',
  'I have the right to be witnessed without judgment.',
  'I have the right to sit in not-knowing without being fixed.',
  'I have the right to change my mind.',
  'I have the right to struggle and still belong.',
  'I have the right to protect my private interior life.',
  'I have the right to leave when I am ready.',
];

type Props = NativeStackScreenProps<AppStackParamList, 'Declaration'>;

export default function DeclarationScreen({ navigation }: Props) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const setDeclarationRead = useOnboardingStore((s) => s.setDeclarationRead);

  function onScroll({
    nativeEvent,
  }: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 24) {
      setScrolledToEnd(true);
    }
  }

  function onContinue() {
    setDeclarationRead();
    navigation.navigate('Covenant');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        <Text style={styles.heading}>Declaration{'\n'}of Inner Rights</Text>
        {RIGHTS.map((right, i) => (
          <View key={i} style={styles.rightRow}>
            <Text style={styles.number}>{i + 1}</Text>
            <Text style={styles.right}>{right}</Text>
          </View>
        ))}
        <View style={styles.bottomPad} />
      </ScrollView>

      <Pressable
        style={[styles.button, !scrolledToEnd && styles.buttonDisabled]}
        onPress={scrolledToEnd ? onContinue : undefined}
        accessibilityRole="button"
        accessibilityState={{ disabled: !scrolledToEnd }}
      >
        <Text style={styles.buttonText}>I have read these rights</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  scroll: { flex: 1 },
  content: { padding: 32, paddingTop: 64 },
  heading: {
    fontSize: 26,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 1,
    lineHeight: 38,
    marginBottom: 40,
  },
  rightRow: { flexDirection: 'row', marginBottom: 28 },
  number: { fontSize: 13, color: '#555', width: 24, paddingTop: 3 },
  right: { flex: 1, fontSize: 16, color: '#c8c8c8', lineHeight: 26, fontWeight: '300' },
  bottomPad: { height: 40 },
  button: {
    margin: 20,
    padding: 18,
    backgroundColor: '#1a2e3a',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { color: '#f5f5f5', fontSize: 15, fontWeight: '300', letterSpacing: 0.5 },
});
