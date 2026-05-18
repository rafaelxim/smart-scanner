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
  extractedText: string | null;
  category: ReceiptClassification;
  createdAt: string;
  updatedAt: string;
}

export interface UploadReceiptResponse {
  receipt: ReceiptRecord;
  ocrStatus: "ok" | "failed";
}

