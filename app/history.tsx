import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { HistoryEntry } from '../types/scan';
import { clearHistory, readHistory } from '../utils/storage';

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await readHistory<HistoryEntry>();
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    setEntries(sorted);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setEntries([]);
    Alert.alert('History cleared', 'Your saved scans have been removed.');
  };

  const openSavedResult = (entry: HistoryEntry) => {
    router.push({
      pathname: '/result',
      params: {
        imageUri: entry.imageUri,
        result: JSON.stringify(entry.result),
        source: 'history',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>History</Text>
          <Link href="/" asChild>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to camera">
              <Text style={styles.linkText}>Back</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>Your recent scans will appear here once you start scanning.</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={`${entry.timestamp}-${entry.name}`}
              accessibilityRole="button"
              accessibilityLabel={`Open result for ${entry.name}`}
              style={styles.historyCard}
              onPress={() => openSavedResult(entry)}
            >
              <Text style={styles.entryName}>{entry.name}</Text>
              <Text style={styles.entryCategory}>{entry.category}</Text>
              <Text style={styles.entryTime}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          ))
        )}

        {entries.length > 0 ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear history"
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>
        ) : null}
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    marginTop: 8,
    color: '#4B5563',
    lineHeight: 22,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  entryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  entryCategory: {
    marginTop: 4,
    color: '#4B5563',
    fontSize: 15,
  },
  entryTime: {
    marginTop: 8,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  clearButton: {
    marginTop: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
});
