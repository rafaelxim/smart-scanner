import { ReceiptExtractionStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { readFile } from "node:fs/promises";
import type { ReceiptExtractionClientConfig } from "./openaiClient.js";
import { createReceiptExtractionClient } from "./openaiClient.js";
import { ReceiptExtractionRepository } from "./repository.js";
import {
  parseExtractedReceiptPayload,
  receiptExtractionJsonSchema,
  type ExtractedReceiptPayload,
} from "./schema.js";
import type { ReceiptExtractionRecord } from "./types.js";

export interface CreateUploadFallbackExtractionInput {
  tempImagePath: string;
  imageOriginalFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
}

export interface ExtractReceiptFromImageInput {
  tempImagePath: string;
  imageOriginalFilename: string;
  imageMimeType: string;
  imageSizeBytes: number;
}

export class ReceiptExtractionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ReceiptExtractionError";
  }
}

export class ReceiptExtractionService {
  constructor(
    private readonly receiptExtractionRepository: ReceiptExtractionRepository,
    private readonly extractionClientConfig?: ReceiptExtractionClientConfig,
  ) {}

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

  async extractReceiptFromImage(
    input: ExtractReceiptFromImageInput,
  ): Promise<ReceiptExtractionRecord> {
    const extractionClientConfig = this.extractionClientConfig;

    if (!extractionClientConfig) {
      throw new ReceiptExtractionError(
        "openai_not_configured",
        "OpenAI receipt extraction is not configured.",
      );
    }

    const extractedPayload = await this.extractPayload(input, extractionClientConfig);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.receiptExtractionRepository.create({
      status: ReceiptExtractionStatus.COMPLETED,
      tempImagePath: input.tempImagePath,
      imageOriginalFilename: input.imageOriginalFilename,
      imageMimeType: input.imageMimeType,
      imageSizeBytes: input.imageSizeBytes,
      extractedPayload: extractedPayload as unknown as Prisma.InputJsonValue,
      expiresAt,
    });
  }

  private async extractPayload(
    input: ExtractReceiptFromImageInput,
    extractionClientConfig: ReceiptExtractionClientConfig,
  ): Promise<ExtractedReceiptPayload> {
    const extractionClient = createReceiptExtractionClient(extractionClientConfig);
    const imageBuffer = await readFile(input.tempImagePath);
    const imageDataUrl = `data:${input.imageMimeType};base64,${imageBuffer.toString("base64")}`;

    const response = await this.createOpenAIReceiptExtractionResponse(
      extractionClient,
      imageDataUrl,
    );

    if (response.error) {
      throw new ReceiptExtractionError(response.error.code, response.error.message);
    }

    const outputText = response.output_text;

    if (!outputText) {
      throw new ReceiptExtractionError(
        "openai_empty_response",
        "OpenAI returned an empty receipt extraction response.",
      );
    }

    try {
      return parseExtractedReceiptPayload(JSON.parse(outputText));
    } catch (error) {
      if (error instanceof ReceiptExtractionError) {
        throw error;
      }

      throw new ReceiptExtractionError(
        "invalid_openai_extraction_payload",
        error instanceof Error ? error.message : "OpenAI returned invalid JSON.",
      );
    }
  }

  private async createOpenAIReceiptExtractionResponse(
    extractionClient: ReturnType<typeof createReceiptExtractionClient>,
    imageDataUrl: string,
  ) {
    try {
      return await extractionClient.client.responses.create({
        model: extractionClient.model,
        instructions:
          "Extract structured data from a Brazilian market/grocery receipt. Return only data visible in the image. Use null when a field is not visible. Do not infer missing prices.",
        input: [
          {
            role: "user",
            type: "message",
            content: [
              {
                type: "input_text",
                text: "Read this market receipt image and extract the market name, purchase date, official total, and line items.",
              },
              {
                type: "input_image",
                detail: "high",
                image_url: imageDataUrl,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "market_receipt_extraction",
            strict: true,
            schema: receiptExtractionJsonSchema,
          },
        },
      });
    } catch (error) {
      throw new ReceiptExtractionError(
        "openai_receipt_extraction_failed",
        error instanceof Error ? error.message : "OpenAI receipt extraction failed.",
      );
    }
  }
}
