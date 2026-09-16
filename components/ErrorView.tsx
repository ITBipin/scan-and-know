import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorView({ title = 'Something went wrong', message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retry scan" style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#F4F6FB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
