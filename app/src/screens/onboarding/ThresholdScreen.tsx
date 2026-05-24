import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Threshold'>;

export default function ThresholdScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.navigate('Declaration')}
        style={styles.touch}
        accessibilityRole="button"
        accessibilityLabel="Enter Moatly"
      >
        <Text style={styles.word}>Moatly</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touch: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  word: {
    fontSize: 34,
    fontWeight: '200',
    color: '#f5f5f5',
    letterSpacing: 10,
  },
});
