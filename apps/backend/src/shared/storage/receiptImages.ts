import { randomUUID } from "node:crypto";
import { mkdir, rename } from "node:fs/promises";
import { extname, join } from "node:path";

export interface PromotedReceiptImage {
  finalImagePath: string;
  tempImagePath: string;
}

export class ReceiptImageStorage {
  constructor(private readonly uploadsDir: string) {}

  async promoteTemporaryReceiptImage(tempImagePath: string): Promise<PromotedReceiptImage> {
    const finalImagesDir = join(this.uploadsDir, "receipts");
    await mkdir(finalImagesDir, { recursive: true });

    const extension = extname(tempImagePath) || ".jpg";
    const finalImagePath = join(finalImagesDir, `${randomUUID()}${extension}`);

    await rename(tempImagePath, finalImagePath);

    return {
      finalImagePath,
      tempImagePath,
    };
  }

  async restorePromotedReceiptImage(promotedImage: PromotedReceiptImage): Promise<void> {
    await rename(promotedImage.finalImagePath, promotedImage.tempImagePath);
  }
}
