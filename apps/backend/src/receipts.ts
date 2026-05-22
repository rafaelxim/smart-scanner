import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export type ReceiptClassification =
  | "Food"
  | "Transport"
  | "Health"
  | "Education"
  | "Home"
  | "Business"
  | "Unclassified";

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

export interface CreateReceiptInput {
  imagePath: string;
  imageFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
  extractedText?: string | null;
  extractedMerchantName?: string | null;
  extractedPurchasedAt?: string | null;
  extractedTotalAmountCents?: number | null;
  category?: ReceiptClassification;
}

interface ReceiptRow {
  id: string;
  image_path: string;
  image_filename: string;
  image_mime_type: string;
  image_size_bytes: number;
  extracted_text: string | null;
  extracted_merchant_name: string | null;
  extracted_purchased_at: string | null;
  extracted_total_amount_cents: number | null;
  category: ReceiptClassification;
  created_at: string;
  updated_at: string;
}

export class ReceiptRepository {
  constructor(private readonly database: DatabaseSync) {}

  create(input: CreateReceiptInput): ReceiptRecord {
    const now = new Date().toISOString();
    const receipt: ReceiptRecord = {
      id: randomUUID(),
      imagePath: input.imagePath,
      imageFilename: input.imageFilename,
      imageMimeType: input.imageMimeType,
      imageSizeBytes: input.imageSizeBytes,
      extractedText: input.extractedText ?? null,
      extractedMerchantName: input.extractedMerchantName ?? null,
      extractedPurchasedAt: input.extractedPurchasedAt ?? null,
      extractedTotalAmountCents: input.extractedTotalAmountCents ?? null,
      category: input.category ?? "Unclassified",
      createdAt: now,
      updatedAt: now,
    };

    this.database
      .prepare(`
        INSERT INTO receipts (
          id,
          image_path,
          image_filename,
          image_mime_type,
          image_size_bytes,
          extracted_text,
          extracted_merchant_name,
          extracted_purchased_at,
          extracted_total_amount_cents,
          category,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        receipt.id,
        receipt.imagePath,
        receipt.imageFilename,
        receipt.imageMimeType,
        receipt.imageSizeBytes,
        receipt.extractedText,
        receipt.extractedMerchantName,
        receipt.extractedPurchasedAt,
        receipt.extractedTotalAmountCents,
        receipt.category,
        receipt.createdAt,
        receipt.updatedAt,
      );

    return receipt;
  }

  findById(id: string): ReceiptRecord | null {
    const row = this.database
      .prepare("SELECT * FROM receipts WHERE id = ?")
      .get(id) as ReceiptRow | undefined;

    return row ? mapReceiptRow(row) : null;
  }
}

function mapReceiptRow(row: ReceiptRow): ReceiptRecord {
  return {
    id: row.id,
    imagePath: row.image_path,
    imageFilename: row.image_filename,
    imageMimeType: row.image_mime_type,
    imageSizeBytes: row.image_size_bytes,
    extractedText: row.extracted_text,
    extractedMerchantName: row.extracted_merchant_name,
    extractedPurchasedAt: row.extracted_purchased_at,
    extractedTotalAmountCents: row.extracted_total_amount_cents,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
