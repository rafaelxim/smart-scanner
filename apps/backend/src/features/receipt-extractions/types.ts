import type { Prisma, ReceiptExtractionStatus } from "@prisma/client";

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

export interface CreateReceiptExtractionInput {
  status: ReceiptExtractionStatus;
  tempImagePath: string;
  imageOriginalFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
  extractedPayload?: Prisma.InputJsonValue;
  errorCode?: string | null;
  errorMessage?: string | null;
  expiresAt: Date;
}
