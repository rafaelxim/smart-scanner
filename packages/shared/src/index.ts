export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Health"
  | "Education"
  | "Home"
  | "Business";

export type ReceiptClassification = ExpenseCategory | "Unclassified";

export interface ReceiptRecord {
  id: string;
  imagePath: string;
  imageFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
  extractedText: string | null;
  extractedMerchantName: string | null;
  extractedPurchasedAt: string | null;
  extractedTotalAmountCents: number | null;
  category: ReceiptClassification;
  createdAt: string;
  updatedAt: string;
}

export interface UploadReceiptResponse {
  receipt: ReceiptRecord;
  ocrStatus: "ok" | "failed";
}
