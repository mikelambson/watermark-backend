-- CreateTable
CREATE TABLE "auth"."UserMeta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "preferences" JSONB,
    "authorizedSerials" JSONB,
    "adminNotes" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMeta_userId_idx" ON "auth"."UserMeta"("userId");

-- AddForeignKey
ALTER TABLE "auth"."UserMeta" ADD CONSTRAINT "UserMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
