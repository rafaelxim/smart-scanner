import { ReceiptExtractionStatus } from "@prisma/client";
import { ReceiptExtractionRepository } from "./repository.js";
import type { ReceiptExtractionRecord } from "./types.js";

export interface CreateUploadFallbackExtractionInput {
  tempImagePath: string;
  imageOriginalFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
}

export class ReceiptExtractionService {
  constructor(private readonly receiptExtractionRepository: ReceiptExtractionRepository) {}

  createUploadFallbackExtraction(
    input: CreateUploadFallbackExtractionInput,
  ): Promise<ReceiptExtractionRecord> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.receiptExtractionRepository.create({
      status: ReceiptExtractionStatus.FAILED,
      tempImagePath: input.tempImagePath,
      imageOriginalFilename: input.imageOriginalFilename,
      imageMimeType: input.imageMimeType,
      imageSizeBytes: input.imageSizeBytes,
      errorCode: "extraction_not_configured",
      errorMessage: "Receipt extraction is not configured yet.",
      expiresAt,
    });
  }
}
