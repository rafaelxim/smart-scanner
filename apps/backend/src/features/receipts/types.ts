import type { ReceiptItemCategory } from "@prisma/client";

export interface ConfirmReceiptItemInput {
  originalName: string;
  quantity?: string | number | null;
  unit?: string | null;
  unitPriceAmountCents?: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
}

export interface ConfirmReceiptInput {
  extractionId?: string | null;
  marketName: string;
  purchaseDate: string;
  officialTotalAmountCents: number;
  imagePath: string;
  items: ConfirmReceiptItemInput[];
}

export interface ReceiptItemRecord {
  id: string;
  position: number;
  originalName: string;
  quantity: string | null;
  unit: string | null;
  unitPriceAmountCents: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptRecord {
  id: string;
  marketName: string;
  purchaseDate: string;
  officialTotalAmountCents: number;
  items: ReceiptItemRecord[];
  createdAt: string;
  updatedAt: string;
}
