import type { ReceiptExtraction, ReceiptExtractionStatus } from "@prisma/client";
import type { AppPrismaClient, PrismaTransaction } from "../../shared/database/prisma.js";
import type { CreateReceiptExtractionInput, ReceiptExtractionRecord } from "./types.js";

type PrismaExecutor = AppPrismaClient | PrismaTransaction;

export class ReceiptExtractionRepository {
  constructor(private readonly prisma: AppPrismaClient) {}

  create(input: CreateReceiptExtractionInput): Promise<ReceiptExtractionRecord> {
    return createReceiptExtraction(this.prisma, input);
  }

  findById(id: string): Promise<ReceiptExtractionRecord | null> {
    return findReceiptExtractionById(this.prisma, id);
  }
}

export async function createReceiptExtraction(
  prisma: PrismaExecutor,
  input: CreateReceiptExtractionInput,
): Promise<ReceiptExtractionRecord> {
  const extraction = await prisma.receiptExtraction.create({
    data: {
      status: input.status,
      tempImagePath: input.tempImagePath,
      imageOriginalFilename: input.imageOriginalFilename,
      imageMimeType: input.imageMimeType,
      imageSizeBytes: input.imageSizeBytes,
      extractedPayload: input.extractedPayload,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
      expiresAt: input.expiresAt,
    },
  });

  return mapReceiptExtraction(extraction);
}

export async function findReceiptExtractionById(
  prisma: PrismaExecutor,
  id: string,
): Promise<ReceiptExtractionRecord | null> {
  const extraction = await prisma.receiptExtraction.findUnique({
    where: { id },
  });

  return extraction ? mapReceiptExtraction(extraction) : null;
}

export async function markReceiptExtractionConfirmed(
  prisma: PrismaExecutor,
  id: string,
  confirmedReceiptId: string,
): Promise<void> {
  await prisma.receiptExtraction.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      confirmedReceiptId,
    },
  });
}

export async function getReceiptExtractionStatus(
  prisma: PrismaExecutor,
  id: string,
): Promise<ReceiptExtractionStatus | null> {
  const extraction = await prisma.receiptExtraction.findUnique({
    select: { status: true },
    where: { id },
  });

  return extraction?.status ?? null;
}

function mapReceiptExtraction(extraction: ReceiptExtraction): ReceiptExtractionRecord {
  return {
    id: extraction.id,
    status: extraction.status,
    imageOriginalFilename: extraction.imageOriginalFilename,
    imageMimeType: extraction.imageMimeType,
    imageSizeBytes: extraction.imageSizeBytes,
    extractedPayload: extraction.extractedPayload,
    errorCode: extraction.errorCode,
    errorMessage: extraction.errorMessage,
    expiresAt: extraction.expiresAt.toISOString(),
    confirmedReceiptId: extraction.confirmedReceiptId,
    createdAt: extraction.createdAt.toISOString(),
    updatedAt: extraction.updatedAt.toISOString(),
  };
}
