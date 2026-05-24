import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { getRingsForCycle, isDatabaseOpen } from '../../db/queries';
import type { ArcType } from '../../db/schema';

const ARC_COLORS: Record<ArcType, string> = {
  gold: '#c8a040',
  green: '#4a8c5c',
  blue: '#3a6a9c',
  grey: '#5a5a5a',
  fire_scar: '#8c3a2a',
};

const ARC_LABELS: Record<ArcType, string> = {
  gold: 'Gold',
  green: 'Green',
  blue: 'Blue',
  grey: 'Grey',
  fire_scar: 'Fire Scar',
};

interface RingRow {
  id: number;
  cycle_number: number;
  arc_type: ArcType;
  earned_at: number;
}

type Props = NativeStackScreenProps<AppStackParamList, 'Rings'>;

export default function RingsScreen({ navigation }: Props) {
  const [rings, setRings] = useState<RingRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isDatabaseOpen()) {
      setLoaded(true);
      return;
    }
    getRingsForCycle(1)
      .then((rows) => setRings(rows as RingRow[]))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>Rings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!loaded && <Text style={styles.empty}>Loading…</Text>}

        {loaded && rings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No rings yet.</Text>
            <Text style={styles.emptyBody}>
              Rings form through practice over 7-day cycles. Complete your first cycle to see your
              record here.
            </Text>
          </View>
        )}

        {rings.map((ring) => (
          <View key={ring.id} style={styles.ring}>
            <View
              style={[styles.arcDot, { backgroundColor: ARC_COLORS[ring.arc_type] }]}
            />
            <View style={styles.ringInfo}>
              <Text style={styles.arcType}>{ARC_LABELS[ring.arc_type]}</Text>
              <Text style={styles.cycle}>Cycle {ring.cycle_number}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e1e',
  },
  back: { marginRight: 16 },
  backText: { color: '#7eb8d4', fontSize: 15 },
  heading: { fontSize: 20, fontWeight: '200', color: '#f5f5f5', letterSpacing: 1 },
  content: { padding: 24, paddingBottom: 40 },
  empty: { color: '#555', textAlign: 'center', marginTop: 60 },
  emptyState: { marginTop: 60, alignItems: 'center', paddingHorizontal: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '200',
    color: '#888',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  emptyBody: {
    fontSize: 14,
    color: '#555',
    fontWeight: '300',
    lineHeight: 22,
    textAlign: 'center',
  },
  ring: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e1e',
    gap: 16,
  },
  arcDot: { width: 16, height: 16, borderRadius: 8 },
  ringInfo: {},
  arcType: { fontSize: 15, color: '#c8c8c8', fontWeight: '300' },
  cycle: { fontSize: 12, color: '#555', marginTop: 2 },
});
