-- CreateTable
CREATE TABLE `ProductOlfactoryFamily` (
    `productId` VARCHAR(191) NOT NULL,
    `familyId` VARCHAR(191) NOT NULL,

    INDEX `ProductOlfactoryFamily_familyId_idx`(`familyId`),
    PRIMARY KEY (`productId`, `familyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migra os dados existentes (cada produto tinha no máximo uma família) antes de remover a coluna.
INSERT INTO `ProductOlfactoryFamily` (`productId`, `familyId`)
SELECT `id`, `olfactoryFamilyId` FROM `Product` WHERE `olfactoryFamilyId` IS NOT NULL;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_olfactoryFamilyId_fkey`;

-- DropIndex
DROP INDEX `Product_olfactoryFamilyId_idx` ON `Product`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `olfactoryFamilyId`;

-- AddForeignKey
ALTER TABLE `ProductOlfactoryFamily` ADD CONSTRAINT `ProductOlfactoryFamily_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOlfactoryFamily` ADD CONSTRAINT `ProductOlfactoryFamily_familyId_fkey` FOREIGN KEY (`familyId`) REFERENCES `OlfactoryFamily`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
