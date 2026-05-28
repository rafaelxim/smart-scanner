import type OpenAI from "openai";
import {
  createOpenAIClient,
  type OpenAIClientConfig,
} from "../../shared/openai/client.js";

export interface ReceiptExtractionClientConfig extends OpenAIClientConfig {
  model: string;
}

export interface ReceiptExtractionClient {
  client: OpenAI;
  model: string;
}

export function createReceiptExtractionClient(
  config: ReceiptExtractionClientConfig,
): ReceiptExtractionClient {
  return {
    client: createOpenAIClient(config),
    model: config.model,
  };
}
