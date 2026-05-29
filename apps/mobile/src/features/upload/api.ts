import type { ExtractedReceiptResponse } from "@smart-scanner/shared";
import { apiFetch } from "../../shared/api/client";

interface UploadReceiptInput {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
}

export async function uploadReceiptImage(
  input: UploadReceiptInput,
): Promise<ExtractedReceiptResponse> {
  const formData = new FormData();

  formData.append("receipt", {
    uri: input.uri,
    name: input.fileName ?? `receipt-${Date.now()}.jpg`,
    type: input.mimeType ?? "image/jpeg",
  } as unknown as Blob);

  const response = await apiFetch("/receipt-extractions", {
    method: "POST",
    body: formData,
  });

  return response.json() as Promise<ExtractedReceiptResponse>;
}
