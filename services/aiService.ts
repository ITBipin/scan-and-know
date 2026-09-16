import { Alert } from 'react-native';
import type { ScanResult } from '../types/scan';

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';
const API_URL = process.env.EXPO_PUBLIC_AI_API_URL || '';

function normalizeResult(result: any): ScanResult {
  return {
    name: typeof result?.name === 'string' ? result.name : 'Unclear',
    category: typeof result?.category === 'string' ? result.category : 'Unclear',
    confidence: Number.isFinite(result?.confidence) ? Math.min(100, Math.max(0, Number(result.confidence))) : 0,
    whatIsIt: typeof result?.whatIsIt === 'string' ? result.whatIsIt : 'The image could not be confidently identified.',
    uses: Array.isArray(result?.uses) ? result.uses.filter((item: unknown) => typeof item === 'string') : [],
    keyInformation: Array.isArray(result?.keyInformation) ? result.keyInformation.filter((item: unknown) => typeof item === 'string') : [],
    interestingFacts: Array.isArray(result?.interestingFacts) ? result.interestingFacts.filter((item: unknown) => typeof item === 'string') : [],
    warnings: Array.isArray(result?.warnings) ? result.warnings.filter((item: unknown) => typeof item === 'string') : [],
    identificationNotes: typeof result?.identificationNotes === 'string' ? result.identificationNotes : 'Identification is uncertain.',
  };
}

export async function analyzeImage(imageUri: string): Promise<ScanResult> {
  if (!imageUri) {
    throw new Error('Invalid image');
  }

  if (!API_URL) {
    throw new Error('AI service is not configured. Add EXPO_PUBLIC_AI_API_URL in your .env file.');
  }

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'scan.jpg',
  } as any);

  formData.append(
    'prompt',
    `You are a visual information assistant.

Look at this image and identify the main object, animal, plant, food, product, electronic device, vehicle, building, landmark, document, symbol, or other visible subject.

Give useful information about what the user is looking at.

Return JSON in exactly this format:
{
  "name": "",
  "category": "",
  "confidence": 0,
  "whatIsIt": "",
  "uses": [],
  "keyInformation": [],
  "interestingFacts": [],
  "warnings": [],
  "identificationNotes": ""
}

Rules:
- Do not invent information.
- If the image is unclear, say that identification is uncertain.
- confidence must be between 0 and 100.
- Keep information short and easy to understand.
- Only provide warnings when relevant.
- Do not claim exact specifications unless they can actually be identified from the image.
- If you cannot identify the object, clearly say so.`
  );

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const text = await response.text();
    let payload: any = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const extracted = text.slice(firstBrace, lastBrace + 1);
        payload = JSON.parse(extracted || '{}');
      }
    }

    const result = payload?.result ?? payload;
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid AI response');
    }

    return normalizeResult(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid AI response');
    }

    if (error instanceof Error) {
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        throw new Error('Please check your internet connection and try again.');
      }

      throw error;
    }

    throw new Error('Could not analyze this image.');
  }
}

export function showAiConfigurationError() {
  Alert.alert(
    'AI service not configured',
    'Set EXPO_PUBLIC_AI_API_URL and EXPO_PUBLIC_AI_API_KEY in your .env file before scanning.'
  );
}
