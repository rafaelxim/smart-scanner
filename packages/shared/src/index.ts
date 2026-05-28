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

export type ReceiptExtractionStatus = "pending" | "completed" | "failed" | "expired" | "confirmed";

export interface ReceiptExtractionRecord {
  id: string;
  status: ReceiptExtractionStatus;
  imageOriginalFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
  extractedPayload: unknown | null;
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
