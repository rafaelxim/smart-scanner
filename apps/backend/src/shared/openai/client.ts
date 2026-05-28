import OpenAI from "openai";

export class OpenAIConfigurationError extends Error {
  constructor(message = "OPENAI_API_KEY is required for receipt extraction.") {
    super(message);
    this.name = "OpenAIConfigurationError";
  }
}

export interface OpenAIClientConfig {
  apiKey?: string;
}

export function createOpenAIClient(config: OpenAIClientConfig): OpenAI {
  if (!config.apiKey) {
    throw new OpenAIConfigurationError();
  }

  return new OpenAI({
    apiKey: config.apiKey,
  });
}
