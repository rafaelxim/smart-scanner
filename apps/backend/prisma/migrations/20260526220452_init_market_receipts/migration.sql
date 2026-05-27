-- CreateTable
CREATE TABLE `receipt_extractions` (
    `id` VARCHAR(36) NOT NULL,
    `status` ENUM('pending', 'completed', 'failed', 'expired', 'confirmed') NOT NULL DEFAULT 'pending',
    `temp_image_path` VARCHAR(1024) NOT NULL,
    `image_original_filename` VARCHAR(255) NOT NULL,
    `image_mime_type` VARCHAR(100) NOT NULL,
    `image_size_bytes` INTEGER NOT NULL,
    `extracted_payload` JSON NULL,
    `error_code` VARCHAR(100) NULL,
    `error_message` TEXT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `confirmed_receipt_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `receipt_extractions_confirmed_receipt_id_key`(`confirmed_receipt_id`),
    INDEX `receipt_extractions_status_idx`(`status`),
    INDEX `receipt_extractions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipts` (
    `id` VARCHAR(36) NOT NULL,
    `market_name` VARCHAR(255) NOT NULL,
    `purchase_date` DATE NOT NULL,
    `official_total_amount_cents` INTEGER NOT NULL,
    `image_path` VARCHAR(1024) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `receipts_purchase_date_idx`(`purchase_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipt_items` (
    `id` VARCHAR(36) NOT NULL,
    `receipt_id` VARCHAR(36) NOT NULL,
    `position` INTEGER NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 3) NULL,
    `unit` VARCHAR(50) NULL,
    `unit_price_amount_cents` INTEGER NULL,
    `total_amount_cents` INTEGER NOT NULL,
    `category` ENUM('Hortifruti', 'Carnes', 'Laticínios', 'Padaria', 'Mercearia', 'Bebidas', 'Congelados', 'Limpeza', 'Higiene', 'Pet', 'Outros') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `receipt_items_receipt_id_idx`(`receipt_id`),
    INDEX `receipt_items_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `receipt_extractions` ADD CONSTRAINT `receipt_extractions_confirmed_receipt_id_fkey` FOREIGN KEY (`confirmed_receipt_id`) REFERENCES `receipts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipt_items` ADD CONSTRAINT `receipt_items_receipt_id_fkey` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
