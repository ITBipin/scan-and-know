import * as FileSystem from 'expo-file-system';

export async function compressImageIfNeeded(uri: string): Promise<string> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return uri;
    }

    const fileSize = fileInfo.size ?? 0;
    if (fileSize < 1_000_000) {
      return uri;
    }

    const targetUri = uri.replace(/\.[^.]+$/, '') + '-compressed.jpg';
    const result = await FileSystem.copyAsync({
      from: uri,
      to: targetUri,
    });

    const nextUri = typeof result === 'object' && 'uri' in result ? String((result as any).uri) : '';
    return nextUri || uri;
  } catch (error) {
    return uri;
  }
}
