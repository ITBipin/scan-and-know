import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  imageUri?: string;
};

export default function LoadingView({ imageUri }: Props) {
  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.backgroundImage} resizeMode="cover" />
      ) : null}

      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.title}>Analyzing image...</Text>
        <Text style={styles.subtitle}>Identifying object</Text>
        <Text style={styles.subtitle}>Finding useful information</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111D',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(7, 17, 29, 0.6)',
  },
  title: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
  },
});
