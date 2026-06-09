import type {
  ConfirmReceiptRequest,
  ConfirmReceiptResponse,
} from "@smart-scanner/shared";
import { apiFetch } from "../../shared/api/client";

export async function confirmReceipt(
  input: ConfirmReceiptRequest,
): Promise<ConfirmReceiptResponse> {
  const response = await apiFetch("/receipts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return response.json() as Promise<ConfirmReceiptResponse>;
}
