export interface ExtractionResult {
  raw_text: string;
  extracted_data: import("./invoice").ExtractedData;
  confidence_score: number;
  processing_time_ms: number;
}

export interface VendorPattern {
  id: string;
  user_id: string;
  vendor_name: string;
  field_patterns: Record<string, FieldPattern>;
  sample_count: number;
  created_at: string;
  updated_at: string;
}

export interface FieldPattern {
  regex: string;
  anchor: string;
  position: "before" | "after" | "line";
}
