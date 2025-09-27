-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "isFeatured" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Session" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "sessionCartId" TEXT NOT NULL,
    "items" JSON[] DEFAULT ARRAY[]::JSON[],
    "itemsPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "shippingPrice" DECIMAL(12,2) NOT NULL,
    "taxPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionCartId_key" ON "public"."Cart"("sessionCartId");

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
