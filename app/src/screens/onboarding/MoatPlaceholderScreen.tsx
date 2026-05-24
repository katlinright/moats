import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import Lamp from '../../components/Lamp';

type Props = NativeStackScreenProps<AppStackParamList, 'MoatPlaceholder'>;

export default function MoatPlaceholderScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <Text style={styles.title}>Your Moat is forming.</Text>
        <Text style={styles.body}>
          You'll be placed with 8–12 people who share this practice. We'll let you know when your
          group is ready.
        </Text>
        <Pressable style={styles.rings} onPress={() => navigation.navigate('Rings')}>
          <Text style={styles.ringsText}>View your rings →</Text>
        </Pressable>
      </View>
      <Lamp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 24,
  },
  body: {
    fontSize: 15,
    color: '#888',
    fontWeight: '300',
    lineHeight: 24,
    textAlign: 'center',
  },
  rings: { marginTop: 48 },
  ringsText: { fontSize: 14, color: '#7eb8d4', fontWeight: '300', letterSpacing: 0.5 },
});
