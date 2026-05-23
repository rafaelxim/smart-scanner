import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import type { ReceiptRepository } from "./receipts.js";

export interface UploadRoutesOptions {
  receiptRepository: ReceiptRepository;
  uploadsDir: string;
}

export async function registerUploadRoutes(
  app: FastifyInstance,
  { receiptRepository, uploadsDir }: UploadRoutesOptions,
): Promise<void> {
  await mkdir(uploadsDir, { recursive: true });

  await app.register(multipart, {
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 1,
    },
  });

  app.post("/receipts", async (request, reply) => {
    const file = await request.file();

    if (!file) {
      return reply.code(400).send({ error: "receipt_file_required" });
    }

    if (file.fieldname !== "receipt") {
      await file.file.resume();
      return reply.code(400).send({ error: "invalid_file_field" });
    }

    if (!file.mimetype.startsWith("image/")) {
      await file.file.resume();
      return reply.code(415).send({ error: "unsupported_media_type" });
    }

    const originalFilename = basename(file.filename || "receipt.jpg");
    const extension = extname(originalFilename) || ".jpg";
    const storedFilename = `${randomUUID()}${extension}`;
    const storedPath = join(uploadsDir, storedFilename);

    let imageSizeBytes = 0;
    file.file.on("data", (chunk: Buffer) => {
      imageSizeBytes += chunk.length;
    });

    await pipeline(file.file, createWriteStream(storedPath));

    const receipt = receiptRepository.create({
      imagePath: storedPath,
      imageFilename: originalFilename,
      imageMimeType: file.mimetype,
      imageSizeBytes,
    });

    return reply.code(201).send({
      receipt,
      ocrStatus: "failed",
    });
  });
}
