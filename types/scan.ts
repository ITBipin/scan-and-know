export interface ScanResult {
  name: string;
  category: string;
  confidence: number;
  whatIsIt: string;
  uses: string[];
  keyInformation: string[];
  interestingFacts: string[];
  warnings: string[];
  identificationNotes: string;
}

export type HistoryEntry = {
  imageUri: string;
  name: string;
  category: string;
  result: ScanResult;
  timestamp: number;
};
