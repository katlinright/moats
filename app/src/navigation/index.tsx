import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { isOnboardingComplete, getStoredDbKey } from '../crypto/keys';
import { openDatabase, isDatabaseOpen } from '../db/queries';
import { useOnboardingStore } from '../state/onboardingStore';

import ThresholdScreen from '../screens/onboarding/ThresholdScreen';
import DeclarationScreen from '../screens/onboarding/DeclarationScreen';
import CovenantScreen from '../screens/onboarding/CovenantScreen';
import SeedPhraseScreen from '../screens/onboarding/SeedPhraseScreen';
import TwoQuestionsScreen from '../screens/onboarding/TwoQuestionsScreen';
import LampIntroScreen from '../screens/onboarding/LampIntroScreen';
import MoatPlaceholderScreen from '../screens/onboarding/MoatPlaceholderScreen';
import RingsScreen from '../screens/rings/RingsScreen';

import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0d0d0d' },
  animation: 'fade' as const,
};

export default function AppNavigator() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof AppStackParamList>('Threshold');
  const hydrateComplete = useOnboardingStore((s) => s.hydrateComplete);

  useEffect(() => {
    async function init() {
      try {
        const complete = await isOnboardingComplete();
        if (complete) {
          const key = await getStoredDbKey();
          if (key && !isDatabaseOpen()) {
            await openDatabase(key);
          }
          hydrateComplete();
          setInitialRoute('MoatPlaceholder');
        }
      } finally {
        setReady(true);
      }
    }
    init();
  }, [hydrateComplete]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#7eb8d4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="Threshold" component={ThresholdScreen} />
        <Stack.Screen name="Declaration" component={DeclarationScreen} />
        <Stack.Screen name="Covenant" component={CovenantScreen} />
        <Stack.Screen name="SeedPhrase" component={SeedPhraseScreen} />
        <Stack.Screen name="TwoQuestions" component={TwoQuestionsScreen} />
        <Stack.Screen name="LampIntro" component={LampIntroScreen} />
        <Stack.Screen name="MoatPlaceholder" component={MoatPlaceholderScreen} />
        <Stack.Screen name="Rings" component={RingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center' },
});
