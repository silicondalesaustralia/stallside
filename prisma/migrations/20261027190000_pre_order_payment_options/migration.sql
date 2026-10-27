-- AlterTable
ALTER TABLE "Product" ADD COLUMN "paymentOptions" "PaymentTiming"[] DEFAULT ARRAY[]::"PaymentTiming"[];

-- AlterTable
ALTER TABLE "PreOrderPage" ADD COLUMN "paymentOptions" "PaymentTiming"[] DEFAULT ARRAY[]::"PaymentTiming"[];
