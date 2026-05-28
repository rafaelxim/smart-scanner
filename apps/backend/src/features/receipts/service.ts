import { ReceiptItemCategory } from "@prisma/client";
import type { AppPrismaClient } from "../../shared/database/prisma.js";
import {
  getReceiptExtractionStatus,
  markReceiptExtractionConfirmed,
} from "../receipt-extractions/repository.js";
import { createConfirmedReceipt } from "./repository.js";
import type { ConfirmReceiptInput, ReceiptRecord } from "./types.js";

const categoryValues = new Set<string>(Object.values(ReceiptItemCategory));

export class ReceiptService {
  constructor(private readonly prisma: AppPrismaClient) {}

  async confirmReceipt(input: ConfirmReceiptInput): Promise<ReceiptRecord> {
    validateConfirmReceiptInput(input);

    return this.prisma.$transaction(async (tx) => {
      if (input.extractionId) {
        const status = await getReceiptExtractionStatus(tx, input.extractionId);

        if (!status) {
          throw new Error("receipt_extraction_not_found");
        }

        if (status !== "COMPLETED") {
          throw new Error("receipt_extraction_not_completed");
        }
      }

      const receipt = await createConfirmedReceipt(tx, input);

      if (input.extractionId) {
        await markReceiptExtractionConfirmed(tx, input.extractionId, receipt.id);
      }

      return receipt;
    });
  }
}

function validateConfirmReceiptInput(input: ConfirmReceiptInput): void {
  if (!input.marketName.trim()) {
    throw new Error("market_name_required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.purchaseDate)) {
    throw new Error("invalid_purchase_date");
  }

  if (!Number.isInteger(input.officialTotalAmountCents)) {
    throw new Error("invalid_official_total_amount_cents");
  }

  if (!input.imagePath.trim()) {
    throw new Error("image_path_required");
  }

  if (input.items.length === 0) {
    throw new Error("receipt_items_required");
  }

  input.items.forEach((item) => {
    if (!item.originalName.trim()) {
      throw new Error("item_original_name_required");
    }

    if (!Number.isInteger(item.totalAmountCents)) {
      throw new Error("invalid_item_total_amount_cents");
    }

    if (!categoryValues.has(item.category)) {
      throw new Error("invalid_item_category");
    }
  });
}
