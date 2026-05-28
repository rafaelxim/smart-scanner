import type { Receipt, ReceiptItem } from "@prisma/client";
import type { AppPrismaClient, PrismaTransaction } from "../../shared/database/prisma.js";
import type { ConfirmReceiptInput, ReceiptItemRecord, ReceiptRecord } from "./types.js";

type PrismaExecutor = AppPrismaClient | PrismaTransaction;

export class ReceiptRepository {
  constructor(private readonly prisma: AppPrismaClient) {}

  createConfirmed(input: ConfirmReceiptInput): Promise<ReceiptRecord> {
    return createConfirmedReceipt(this.prisma, input);
  }

  findById(id: string): Promise<ReceiptRecord | null> {
    return findReceiptById(this.prisma, id);
  }
}

export async function createConfirmedReceipt(
  prisma: PrismaExecutor,
  input: ConfirmReceiptInput,
): Promise<ReceiptRecord> {
  const receipt = await prisma.receipt.create({
    data: {
      marketName: input.marketName,
      purchaseDate: parsePurchaseDate(input.purchaseDate),
      officialTotalAmountCents: input.officialTotalAmountCents,
      imagePath: input.imagePath,
      items: {
        create: input.items.map((item, index) => ({
          position: index + 1,
          originalName: item.originalName,
          quantity: item.quantity ?? null,
          unit: item.unit ?? null,
          unitPriceAmountCents: item.unitPriceAmountCents ?? null,
          totalAmountCents: item.totalAmountCents,
          category: item.category,
        })),
      },
    },
    include: {
      items: {
        orderBy: { position: "asc" },
      },
    },
  });

  return mapReceipt(receipt);
}

export async function findReceiptById(
  prisma: PrismaExecutor,
  id: string,
): Promise<ReceiptRecord | null> {
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { position: "asc" },
      },
    },
  });

  return receipt ? mapReceipt(receipt) : null;
}

function parsePurchaseDate(purchaseDate: string): Date {
  return new Date(`${purchaseDate}T00:00:00.000Z`);
}

function mapReceipt(receipt: Receipt & { items: ReceiptItem[] }): ReceiptRecord {
  return {
    id: receipt.id,
    marketName: receipt.marketName,
    purchaseDate: receipt.purchaseDate.toISOString().slice(0, 10),
    officialTotalAmountCents: receipt.officialTotalAmountCents,
    items: receipt.items.map(mapReceiptItem),
    createdAt: receipt.createdAt.toISOString(),
    updatedAt: receipt.updatedAt.toISOString(),
  };
}

function mapReceiptItem(item: ReceiptItem): ReceiptItemRecord {
  return {
    id: item.id,
    position: item.position,
    originalName: item.originalName,
    quantity: item.quantity?.toString() ?? null,
    unit: item.unit,
    unitPriceAmountCents: item.unitPriceAmountCents,
    totalAmountCents: item.totalAmountCents,
    category: item.category,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
