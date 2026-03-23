export type InvoiceStatus = "uploading" | "processing" | "completed" | "failed";

export type FieldSource = "regex" | "vendor_pattern" | "manual" | "llm";

export interface ExtractedField<T = string> {
  value: T;
  confidence: number;
  source: FieldSource;
}

export interface ExtractedData {
  invoice_number: ExtractedField<string>;
  date: ExtractedField<string>;
  total: ExtractedField<number>;
  subtotal: ExtractedField<number>;
  tax: ExtractedField<number>;
  currency: ExtractedField<string>;
  vendor_name: ExtractedField<string>;
}

export interface Invoice {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_hash: string;
  status: InvoiceStatus;
  raw_text: string | null;
  extracted_data: ExtractedData | null;
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number | null;
  currency: string | null;
  tax_amount: number | null;
  subtotal_amount: number | null;
  category: string | null;
  confidence_score: number | null;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  category?: string;
  vendor_name?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  q?: string;
  sort_by?: "created_at" | "invoice_date" | "total_amount" | "vendor_name";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
