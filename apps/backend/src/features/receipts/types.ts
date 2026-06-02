import type { ReceiptItemCategory } from "@prisma/client";

export type ReceiptItemCategoryName =
  | "Hortifruti"
  | "Carnes"
  | "Laticínios"
  | "Padaria"
  | "Mercearia"
  | "Bebidas"
  | "Congelados"
  | "Limpeza"
  | "Higiene"
  | "Pet"
  | "Outros";

export interface ConfirmReceiptItemInput {
  originalName: string;
  quantity?: string | number | null;
  unit?: string | null;
  unitPriceAmountCents?: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
}

export interface ConfirmReceiptInput {
  extractionId: string;
  marketName: string;
  purchaseDate: string;
  officialTotalAmountCents: number;
  items: ConfirmReceiptItemInput[];
}

export interface CreateConfirmedReceiptInput extends ConfirmReceiptInput {
  imagePath: string;
}

export interface ReceiptItemRecord {
  id: string;
  position: number;
  originalName: string;
  quantity: string | null;
  unit: string | null;
  unitPriceAmountCents: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategoryName;
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
