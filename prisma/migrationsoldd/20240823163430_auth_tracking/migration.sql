-- CreateTable
CREATE TABLE "auth"."ActiveSessions" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ActiveSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeseries"."PasswordResets" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "resetToken" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),

    CONSTRAINT "PasswordResets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeseries"."AuthAuditLogs" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAuditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActiveSessions_userId_createdAt_idx" ON "auth"."ActiveSessions"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResets_resetToken_key" ON "timeseries"."PasswordResets"("resetToken");

-- CreateIndex
CREATE INDEX "PasswordResets_userId_createdAt_idx" ON "timeseries"."PasswordResets"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthAuditLogs_userId_createdAt_idx" ON "timeseries"."AuthAuditLogs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "auth"."ActiveSessions" ADD CONSTRAINT "ActiveSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeseries"."PasswordResets" ADD CONSTRAINT "PasswordResets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeseries"."AuthAuditLogs" ADD CONSTRAINT "AuthAuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
