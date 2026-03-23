export interface EditEntry {
  field: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: string;
}

// Store edit history in the extracted_data JSONB under _edit_history key
export function addEditEntry(
  extractedData: any,
  field: string,
  oldValue: string | number,
  newValue: string | number
): any {
  const history: EditEntry[] = extractedData?._edit_history ?? [];
  history.push({ field, oldValue, newValue, timestamp: new Date().toISOString() });
  return { ...extractedData, _edit_history: history };
}
