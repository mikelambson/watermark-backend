-- CreateTable
CREATE TABLE "ops"."Callouts" (
    "id" SERIAL NOT NULL,
    "callout" BOOLEAN DEFAULT false,
    "calloutDone" TIMESTAMP(3),
    "calloutUser" UUID NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Callouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_calloutUser_fkey" FOREIGN KEY ("calloutUser") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
