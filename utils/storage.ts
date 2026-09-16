import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'scan_history';

export async function readHistory<T>(): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch (error) {
    return [];
  }
}

export async function writeHistory<T>(items: T[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
