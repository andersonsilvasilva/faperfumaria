-- AlterTable
ALTER TABLE `Cart` ADD COLUMN `giftMessage` TEXT NULL,
    ADD COLUMN `giftWrap` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `giftMessage` TEXT NULL,
    ADD COLUMN `giftWrap` BOOLEAN NOT NULL DEFAULT false;
