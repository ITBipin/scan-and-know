import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResultCard from '../components/ResultCard';
import type { ScanResult } from '../types/scan';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string; source?: string; result?: string }>();

  const parsedResult: ScanResult | null = params.result ? JSON.parse(params.result as string) : null;
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" accessibilityLabel="Scanned result preview" />
        ) : null}

        {parsedResult ? (
          <>
            <Text style={styles.name}>{parsedResult.name}</Text>
            <Text style={styles.category}>{parsedResult.category}</Text>
            <Text style={styles.confidence}>AI confidence: {parsedResult.confidence}%</Text>

            {parsedResult.confidence < 60 ? (
              <Text style={styles.warning}>Identification may be uncertain. Try taking a clearer photo.</Text>
            ) : null}

            <ResultCard title="What is it?" description={parsedResult.whatIsIt} />
            {parsedResult.uses.length > 0 ? <ResultCard title="Common uses" items={parsedResult.uses} /> : null}
            {parsedResult.keyInformation.length > 0 ? <ResultCard title="Useful information" items={parsedResult.keyInformation} /> : null}
            {parsedResult.interestingFacts.length > 0 ? <ResultCard title="Interesting facts" items={parsedResult.interestingFacts} /> : null}
            {parsedResult.warnings.length > 0 ? <ResultCard title="Warnings" items={parsedResult.warnings} /> : null}
            {parsedResult.identificationNotes ? <ResultCard title="Identification notes" description={parsedResult.identificationNotes} /> : null}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.name}>No result available</Text>
            <Text style={styles.category}>Please return to the camera and try again.</Text>
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Scan again"
          style={styles.primaryButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.primaryButtonText}>Scan Again</Text>
        </TouchableOpacity>
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
    paddingBottom: 48,
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    backgroundColor: '#D7E7FF',
  },
  name: {
    marginTop: 18,
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
  },
  category: {
    marginTop: 2,
    fontSize: 18,
    color: '#4B5563',
    fontWeight: '600',
  },
  confidence: {
    marginTop: 10,
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  warning: {
    marginTop: 12,
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 18,
  },
  primaryButton: {
    marginTop: 26,
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
