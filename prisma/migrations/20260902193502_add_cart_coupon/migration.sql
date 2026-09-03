-- AlterTable
ALTER TABLE `Cart` ADD COLUMN `couponId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
