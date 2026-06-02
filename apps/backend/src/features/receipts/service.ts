import { ReceiptItemCategory } from "@prisma/client";
import type { AppPrismaClient } from "../../shared/database/prisma.js";
import {
  findReceiptExtractionForConfirmation,
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
      const now = new Date();
      const extraction = await findReceiptExtractionForConfirmation(tx, input.extractionId);

      if (!extraction) {
        throw new Error("receipt_extraction_not_found");
      }

      if (extraction.status === "CONFIRMED" || extraction.confirmedReceiptId) {
        throw new Error("receipt_extraction_already_confirmed");
      }

      if (extraction.status !== "COMPLETED") {
        throw new Error("receipt_extraction_not_completed");
      }

      if (extraction.expiresAt <= now) {
        throw new Error("receipt_extraction_expired");
      }

      const receipt = await createConfirmedReceipt(tx, {
        ...input,
        imagePath: extraction.tempImagePath,
      });
      const markedConfirmed = await markReceiptExtractionConfirmed(
        tx,
        input.extractionId,
        receipt.id,
        now,
      );

      if (!markedConfirmed) {
        throw new Error("receipt_extraction_not_confirmable");
      }

      return receipt;
    });
  }
}

function validateConfirmReceiptInput(input: ConfirmReceiptInput): void {
  if (!input.extractionId.trim()) {
    throw new Error("extraction_id_required");
  }

  if (!input.marketName.trim()) {
    throw new Error("market_name_required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.purchaseDate)) {
    throw new Error("invalid_purchase_date");
  }

  if (!Number.isInteger(input.officialTotalAmountCents)) {
    throw new Error("invalid_official_total_amount_cents");
  }

  if (input.officialTotalAmountCents < 0) {
    throw new Error("invalid_official_total_amount_cents");
  }

  if (input.items.length === 0) {
    throw new Error("receipt_items_required");
  }

  input.items.forEach((item) => {
    if (!item.originalName.trim()) {
      throw new Error("item_original_name_required");
    }

    if (
      item.quantity !== null &&
      item.quantity !== undefined &&
      (Number(item.quantity) < 0 || !Number.isFinite(Number(item.quantity)))
    ) {
      throw new Error("invalid_quantity");
    }

    if (
      item.unitPriceAmountCents !== null &&
      item.unitPriceAmountCents !== undefined &&
      (!Number.isInteger(item.unitPriceAmountCents) || item.unitPriceAmountCents < 0)
    ) {
      throw new Error("invalid_item_unit_price_amount_cents");
    }

    if (!Number.isInteger(item.totalAmountCents)) {
      throw new Error("invalid_item_total_amount_cents");
    }

    if (item.totalAmountCents < 0) {
      throw new Error("invalid_item_total_amount_cents");
    }

    if (!categoryValues.has(item.category)) {
      throw new Error("invalid_item_category");
    }
  });
}
