import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { insertCompassEntry } from '../../db/queries';
import { useCompassStore } from '../../state/compassStore';

const MAX_CHARS = 240;
type Props = NativeStackScreenProps<AppStackParamList, 'TwoQuestions'>;

export default function TwoQuestionsScreen({ navigation }: Props) {
  const [whatToFix, setWhatToFix] = useState('');
  const [whyForWhom, setWhyForWhom] = useState('');
  const [saving, setSaving] = useState(false);
  const setCurrent = useCompassStore((s) => s.setCurrent);

  const canSubmit =
    whatToFix.trim().length > 0 && whyForWhom.trim().length > 0 && !saving;

  async function onSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const { id, createdAt, lockedUntil } = await insertCompassEntry(1, whatToFix.trim(), whyForWhom.trim());
      setCurrent({
        id,
        cycleNumber: 1,
        whatToFix: whatToFix.trim(),
        whyForWhom: whyForWhom.trim(),
        createdAt,
        lockedUntil,
      });
      navigation.navigate('LampIntro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Two Questions</Text>
        <Text style={styles.intro}>
          These are your private compass for this cycle. They lock after 24 hours and are never
          shared.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>What do you want to fix?</Text>
          <TextInput
            style={styles.input}
            value={whatToFix}
            onChangeText={(v) => setWhatToFix(v.slice(0, MAX_CHARS))}
            multiline
            placeholder="Be specific. No one will read this."
            placeholderTextColor="#444"
            maxLength={MAX_CHARS}
          />
          <Text style={styles.count}>{whatToFix.length}/{MAX_CHARS}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Why, and for whom?</Text>
          <TextInput
            style={styles.input}
            value={whyForWhom}
            onChangeText={(v) => setWhyForWhom(v.slice(0, MAX_CHARS))}
            multiline
            placeholder="The deeper reason. Name the person if there is one."
            placeholderTextColor="#444"
            maxLength={MAX_CHARS}
          />
          <Text style={styles.count}>{whyForWhom.length}/{MAX_CHARS}</Text>
        </View>

        <View style={styles.lockNote}>
          <Text style={styles.lockNoteText}>
            Once submitted, these questions lock for 24 hours.
          </Text>
        </View>

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={canSubmit ? onSubmit : undefined}
          accessibilityState={{ disabled: !canSubmit }}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Submit & lock'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flex: 1 },
  content: { padding: 32, paddingTop: 64, paddingBottom: 40 },
  heading: {
    fontSize: 26,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 1,
    marginBottom: 16,
  },
  intro: {
    fontSize: 14,
    color: '#888',
    fontWeight: '300',
    lineHeight: 22,
    marginBottom: 40,
  },
  field: { marginBottom: 32 },
  label: { fontSize: 16, color: '#c8c8c8', fontWeight: '300', marginBottom: 12 },
  input: {
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a2a2a',
    borderRadius: 4,
    padding: 14,
    fontSize: 15,
    color: '#f5f5f5',
    fontWeight: '300',
    lineHeight: 22,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  count: { fontSize: 12, color: '#555', textAlign: 'right', marginTop: 6 },
  lockNote: {
    padding: 16,
    backgroundColor: '#0d1f28',
    borderRadius: 4,
    marginBottom: 24,
  },
  lockNoteText: { fontSize: 13, color: '#7eb8d4', fontWeight: '300', textAlign: 'center' },
  button: {
    padding: 18,
    backgroundColor: '#1a2e3a',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.3 },
  buttonText: { color: '#f5f5f5', fontSize: 15, fontWeight: '300', letterSpacing: 0.5 },
});
