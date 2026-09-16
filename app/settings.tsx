import { Link, useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearHistory, readHistory } from '../utils/storage';
import type { HistoryEntry } from '../types/scan';
import { useEffect, useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const [permission] = useCameraPermissions();
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      const entries = await readHistory<HistoryEntry>();
      setHistoryCount(entries.length);
    };
    loadCount();
  }, []);

  const handleClearHistory = async () => {
    await clearHistory();
    setHistoryCount(0);
    Alert.alert('History cleared', 'All saved scans were removed from local storage.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
          <Link href="/" asChild>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to camera">
              <Text style={styles.linkText}>Back</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Scan & Know</Text>
          <Text style={styles.text}>A fast visual identification app designed for quick real-world object scanning.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Camera permission status</Text>
          <Text style={styles.text}>{permission?.status ?? 'unknown'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clear scan history</Text>
          <Text style={styles.text}>{historyCount} saved scans</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear scan history"
            style={styles.button}
            onPress={handleClearHistory}
          >
            <Text style={styles.buttonText}>Clear History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy</Text>
          <Text style={styles.text}>Images are sent to the configured AI service for analysis. No login is required, and no personal account data is collected.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>App version</Text>
          <Text style={styles.text}>1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  content: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  linkText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  text: {
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 22,
  },
  button: {
    marginTop: 14,
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
