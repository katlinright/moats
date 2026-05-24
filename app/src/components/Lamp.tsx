import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Linking,
} from 'react-native';
import { getLocales } from 'expo-localization';
import resources from '../assets/lamp/resources.json';

type ResourceType = 'crisis' | 'mental_health' | 'domestic_abuse' | 'child_safety' | 'emergency';

interface Resource {
  name: string;
  type: ResourceType;
  phone?: string;
  text?: string;
  chat?: string;
  email?: string;
  website?: string;
  hours?: string;
  note?: string;
}

interface CountryResources {
  country: string;
  resources: Resource[];
}

const RESOURCE_LABELS: Record<ResourceType, string> = {
  crisis: 'Crisis',
  mental_health: 'Mental Health',
  domestic_abuse: 'Domestic Abuse',
  child_safety: 'Child Safety',
  emergency: 'Emergency',
};

function getCountryResources(): CountryResources {
  const locale = getLocales()[0];
  const regionCode = locale?.regionCode ?? 'DEFAULT';
  const data = resources as unknown as Record<string, CountryResources>;
  return data[regionCode] ?? data['DEFAULT'];
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{resource.name}</Text>
        <Text style={styles.cardType}>{RESOURCE_LABELS[resource.type]}</Text>
      </View>
      {resource.phone && (
        <Pressable onPress={() => Linking.openURL(`tel:${resource.phone}`)}>
          <Text style={styles.cardContact}>{resource.phone}</Text>
        </Pressable>
      )}
      {resource.text && <Text style={styles.cardContact}>{resource.text}</Text>}
      {resource.email && (
        <Pressable onPress={() => Linking.openURL(`mailto:${resource.email}`)}>
          <Text style={styles.cardContact}>{resource.email}</Text>
        </Pressable>
      )}
      {resource.chat && (
        <Pressable onPress={() => Linking.openURL(resource.chat!)}>
          <Text style={styles.cardContact}>Chat online</Text>
        </Pressable>
      )}
      {resource.website && (
        <Pressable onPress={() => Linking.openURL(resource.website!)}>
          <Text style={styles.cardContact}>{resource.website}</Text>
        </Pressable>
      )}
      {resource.hours && <Text style={styles.cardHours}>{resource.hours}</Text>}
      {resource.note && <Text style={styles.cardNote}>{resource.note}</Text>}
    </View>
  );
}

export default function Lamp() {
  const [open, setOpen] = useState(false);
  const countryData = getCountryResources();

  return (
    <>
      <Pressable
        style={styles.icon}
        onPress={() => setOpen(true)}
        accessibilityLabel="Safety resources"
        accessibilityRole="button"
      >
        <Text style={styles.iconText}>🪔</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>You are not alone.</Text>
            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.modalSub}>{countryData.country}</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {countryData.resources.map((r, i) => (
              <ResourceCard key={i} resource={r} />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  iconText: { fontSize: 26 },
  modal: { flex: 1, backgroundColor: '#0d0d0d' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '300', color: '#f5f5f5', letterSpacing: 0.5 },
  modalSub: { paddingHorizontal: 20, fontSize: 13, color: '#888', marginBottom: 12 },
  closeButton: { padding: 8 },
  closeText: { color: '#c8c8c8', fontSize: 15 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
    paddingVertical: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardName: { fontSize: 16, color: '#f5f5f5', fontWeight: '400', flex: 1 },
  cardType: { fontSize: 12, color: '#666', alignSelf: 'center' },
  cardContact: { fontSize: 15, color: '#7eb8d4', marginBottom: 4 },
  cardHours: { fontSize: 13, color: '#888', marginTop: 4 },
  cardNote: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
});
