-- AlterTable
ALTER TABLE `Payment` MODIFY `method` ENUM('PIX', 'CARD', 'CASH') NOT NULL;
