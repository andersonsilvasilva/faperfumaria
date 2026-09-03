-- AlterTable
ALTER TABLE `Order` ADD COLUMN `shippingCity` VARCHAR(191) NULL,
    ADD COLUMN `shippingComplement` VARCHAR(191) NULL,
    ADD COLUMN `shippingNeighborhood` VARCHAR(191) NULL,
    ADD COLUMN `shippingNumber` VARCHAR(191) NULL,
    ADD COLUMN `shippingState` VARCHAR(191) NULL,
    ADD COLUMN `shippingStreet` VARCHAR(191) NULL,
    ADD COLUMN `shippingZipCode` VARCHAR(191) NULL;
