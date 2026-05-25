import { apiFetch } from "../../shared/api/client";

interface UploadReceiptInput {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
}

export async function uploadReceiptImage(input: UploadReceiptInput): Promise<void> {
  const formData = new FormData();

  formData.append("receipt", {
    uri: input.uri,
    name: input.fileName ?? `receipt-${Date.now()}.jpg`,
    type: input.mimeType ?? "image/jpeg",
  } as unknown as Blob);

  await apiFetch("/receipts", {
    method: "POST",
    body: formData,
  });
}
