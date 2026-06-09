export type ReceiptItemCategory =
  | "Hortifruti"
  | "Carnes"
  | "Laticínios"
  | "Padaria"
  | "Mercearia"
  | "Bebidas"
  | "Congelados"
  | "Limpeza"
  | "Higiene"
  | "Pet"
  | "Outros";

export const receiptItemCategories = [
  "Hortifruti",
  "Carnes",
  "Laticínios",
  "Padaria",
  "Mercearia",
  "Bebidas",
  "Congelados",
  "Limpeza",
  "Higiene",
  "Pet",
  "Outros",
] as const satisfies readonly ReceiptItemCategory[];

export type ReceiptExtractionStatus = "pending" | "completed" | "failed" | "expired" | "confirmed";

export interface ExtractedReceiptItem {
  originalName: string;
  quantity: number | null;
  unit: string | null;
  unitPriceAmountCents: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
}

export interface ExtractedReceiptPayload {
  marketName: string | null;
  purchaseDate: string | null;
  officialTotalAmountCents: number | null;
  items: ExtractedReceiptItem[];
}

export interface ExtractedReceiptResponse {
  extractionId: string;
  receipt: ExtractedReceiptPayload;
}

export interface ConfirmReceiptItemInput {
  originalName: string;
  quantity?: string | number | null;
  unit?: string | null;
  unitPriceAmountCents?: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
}

export interface ConfirmReceiptPayload {
  marketName: string;
  purchaseDate: string;
  officialTotalAmountCents: number;
  items: ConfirmReceiptItemInput[];
}

export interface ConfirmReceiptRequest {
  extractionId: string;
  receipt: ConfirmReceiptPayload;
}

export interface ReceiptItemRecord {
  id: string;
  position: number;
  originalName: string;
  quantity: string | null;
  unit: string | null;
  unitPriceAmountCents: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptRecord {
  id: string;
  marketName: string;
  purchaseDate: string;
  officialTotalAmountCents: number;
  items: ReceiptItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmReceiptResponse {
  receipt: ReceiptRecord;
}

export interface ReceiptExtractionRecord {
  id: string;
  status: ReceiptExtractionStatus;
  imageOriginalFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
  extractedPayload: ExtractedReceiptPayload | null;
  errorCode: string | null;
  errorMessage: string | null;
  expiresAt: string;
  confirmedReceiptId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadReceiptResponse {
  receiptExtraction: ReceiptExtractionRecord;
  extractionStatus: "failed";
}
