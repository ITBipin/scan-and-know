import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingView from './LoadingView';
import { analyzeImage } from '../services/aiService';
import { compressImageIfNeeded } from '../utils/image';
import type { ScanResult } from '../types/scan';

const APP_NAME = 'Scan & Know';

export default function CameraView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const requestCameraAccess = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Camera access needed',
        'Camera access is required to scan objects. Please allow access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  useEffect(() => {
    if (permission && permission.status === 'undetermined') {
      requestCameraAccess();
    }
  }, [permission]);

  const openResult = (imageUri: string, result: ScanResult, source: 'camera' | 'gallery') => {
    router.push({
      pathname: '/result',
      params: {
        imageUri,
        result: JSON.stringify(result),
        source,
      },
    });
  };

  const handleAnalyze = async (imageUri: string, source: 'camera' | 'gallery') => {
    if (isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setPendingImage(imageUri);

      const compressedUri = await compressImageIfNeeded(imageUri);
      const result = await analyzeImage(compressedUri);
      openResult(compressedUri || imageUri, result, source);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to analyze this image.';
      Alert.alert(
        "Couldn't analyze this image.",
        message.includes('internet') || message.includes('fetch')
          ? 'Please check your internet connection and try again.'
          : message
      );
    } finally {
      setIsAnalyzing(false);
      setPendingImage(null);
    }
  };

  const handleCapture = async () => {
    if (isCapturing || isAnalyzing || !cameraRef.current || !cameraReady) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      if (!photo?.uri) {
        throw new Error('Image capture failed');
      }

      await handleAnalyze(photo.uri, 'camera');
    } catch (error) {
      Alert.alert('Capture failed', 'Could not capture the image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Gallery access needed', 'Please allow photo access to choose an image from your gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      await handleAnalyze(result.assets[0].uri, 'gallery');
    } catch (error) {
      Alert.alert('Gallery error', 'The selected image could not be opened.');
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (permission.status === 'denied') {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera access is off</Text>
        <Text style={styles.permissionText}>
          To use Scan & Know, please allow camera access so you can scan objects in real time.
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={permission.canAskAgain ? 'Request camera permission' : 'Open device settings'}
          style={styles.permissionButton}
          onPress={permission.canAskAgain ? requestCameraAccess : () => Linking.openSettings()}
        >
          <Text style={styles.permissionButtonText}>
            {permission.canAskAgain ? 'Allow Camera' : 'Open Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isAnalyzing && pendingImage) {
    return <LoadingView imageUri={pendingImage} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back" onCameraReady={() => setCameraReady(true)} />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.headerRow}>
          <Link href="/history" asChild>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open scan history" style={styles.headerButton}>
              <Text style={styles.headerButtonText}>History</Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.appTitle}>{APP_NAME}</Text>

          <Link href="/settings" asChild>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open settings" style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Settings</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose image from gallery"
            onPress={handleGalleryPick}
            style={styles.galleryButton}
          >
            <Text style={styles.galleryButtonText}>Gallery</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan current image"
            onPress={handleCapture}
            disabled={isCapturing || isAnalyzing || !cameraReady}
            style={[styles.scanButton, (isCapturing || isAnalyzing || !cameraReady) && styles.scanButtonDisabled]}
          >
            <View style={styles.scanButtonInner} />
          </Pressable>

          <View style={styles.spacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111D',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  headerButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  galleryButton: {
    minWidth: 86,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  galleryButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scanButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  spacer: {
    width: 86,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#07111D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#F4F6FB',
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  permissionText: {
    color: '#374151',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
