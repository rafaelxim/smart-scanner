export const receiptItemCategories = [
  "Hortifruti",
  "Carnes",
  "Laticínios",
  "Padaria",
  "Mercearia",
  "Bebidas",
  "Congelados",
  "Limpeza",
  "Higiene",
  "Pet",
  "Outros",
] as const;

export type ReceiptItemCategory = (typeof receiptItemCategories)[number];

export interface ExtractedReceiptItem {
  originalName: string;
  quantity: number | null;
  unit: string | null;
  unitPriceAmountCents: number | null;
  totalAmountCents: number;
  category: ReceiptItemCategory;
}

export interface ExtractedReceiptPayload {
  marketName: string | null;
  purchaseDate: string | null;
  officialTotalAmountCents: number | null;
  items: ExtractedReceiptItem[];
}

const categoryValues = new Set<string>(receiptItemCategories);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export class ReceiptExtractionSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReceiptExtractionSchemaError";
  }
}

export const receiptExtractionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["marketName", "purchaseDate", "officialTotalAmountCents", "items"],
  properties: {
    marketName: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    purchaseDate: {
      anyOf: [{ type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, { type: "null" }],
    },
    officialTotalAmountCents: {
      anyOf: [{ type: "integer" }, { type: "null" }],
    },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "originalName",
          "quantity",
          "unit",
          "unitPriceAmountCents",
          "totalAmountCents",
          "category",
        ],
        properties: {
          originalName: { type: "string" },
          quantity: {
            anyOf: [{ type: "number" }, { type: "null" }],
          },
          unit: {
            anyOf: [{ type: "string" }, { type: "null" }],
          },
          unitPriceAmountCents: {
            anyOf: [{ type: "integer" }, { type: "null" }],
          },
          totalAmountCents: { type: "integer" },
          category: {
            type: "string",
            enum: receiptItemCategories,
          },
        },
      },
    },
  },
} as const;

export function parseExtractedReceiptPayload(value: unknown): ExtractedReceiptPayload {
  if (!isRecord(value)) {
    throw new ReceiptExtractionSchemaError("extraction_payload_must_be_object");
  }

  assertOnlyKnownKeys(value, [
    "marketName",
    "purchaseDate",
    "officialTotalAmountCents",
    "items",
  ]);

  const marketName = parseNullableString(value.marketName, "marketName");
  const purchaseDate = parseNullablePurchaseDate(value.purchaseDate);
  const officialTotalAmountCents = parseNullableInteger(
    value.officialTotalAmountCents,
    "officialTotalAmountCents",
  );

  if (!Array.isArray(value.items)) {
    throw new ReceiptExtractionSchemaError("items_must_be_array");
  }

  return {
    marketName,
    purchaseDate,
    officialTotalAmountCents,
    items: value.items.map(parseExtractedReceiptItem),
  };
}

function parseExtractedReceiptItem(value: unknown): ExtractedReceiptItem {
  if (!isRecord(value)) {
    throw new ReceiptExtractionSchemaError("item_must_be_object");
  }

  assertOnlyKnownKeys(value, [
    "originalName",
    "quantity",
    "unit",
    "unitPriceAmountCents",
    "totalAmountCents",
    "category",
  ]);

  return {
    originalName: parseRequiredString(value.originalName, "originalName"),
    quantity: parseNullableNumber(value.quantity, "quantity"),
    unit: parseNullableString(value.unit, "unit"),
    unitPriceAmountCents: parseNullableInteger(
      value.unitPriceAmountCents,
      "unitPriceAmountCents",
    ),
    totalAmountCents: parseRequiredInteger(value.totalAmountCents, "totalAmountCents"),
    category: parseReceiptItemCategory(value.category),
  };
}

function parseReceiptItemCategory(value: unknown): ExtractedReceiptItem["category"] {
  if (typeof value !== "string" || !categoryValues.has(value)) {
    throw new ReceiptExtractionSchemaError("category_must_be_known_receipt_item_category");
  }

  return value as ExtractedReceiptItem["category"];
}

function parseNullablePurchaseDate(value: unknown): string | null {
  const purchaseDate = parseNullableString(value, "purchaseDate");

  if (purchaseDate !== null && !datePattern.test(purchaseDate)) {
    throw new ReceiptExtractionSchemaError("purchaseDate_must_be_yyyy_mm_dd");
  }

  return purchaseDate;
}

function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ReceiptExtractionSchemaError(`${fieldName}_must_be_string`);
  }

  return value;
}

function parseNullableString(value: unknown, fieldName: string): string | null {
  if (value === null) {
    return null;
  }

  return parseRequiredString(value, fieldName);
}

function parseRequiredInteger(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ReceiptExtractionSchemaError(`${fieldName}_must_be_integer`);
  }

  return value;
}

function parseNullableInteger(value: unknown, fieldName: string): number | null {
  if (value === null) {
    return null;
  }

  return parseRequiredInteger(value, fieldName);
}

function parseNullableNumber(value: unknown, fieldName: string): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ReceiptExtractionSchemaError(`${fieldName}_must_be_number`);
  }

  return value;
}

function assertOnlyKnownKeys(value: Record<string, unknown>, allowedKeys: string[]): void {
  const allowed = new Set(allowedKeys);
  const unknownKey = Object.keys(value).find((key) => !allowed.has(key));

  if (unknownKey) {
    throw new ReceiptExtractionSchemaError(`unknown_field_${unknownKey}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
