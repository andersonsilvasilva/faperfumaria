-- AlterTable
ALTER TABLE `cart` ADD COLUMN `giftMessage` TEXT NULL,
    ADD COLUMN `giftWrap` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `giftMessage` TEXT NULL,
    ADD COLUMN `giftWrap` BOOLEAN NOT NULL DEFAULT false;
