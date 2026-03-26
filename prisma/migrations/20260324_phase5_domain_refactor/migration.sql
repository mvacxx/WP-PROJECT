-- Create enums
CREATE TYPE "InstallationType" AS ENUM ('vps', 'shared_hosting', 'cloud', 'manual');
CREATE TYPE "ContentProvider" AS ENUM ('seowriting', 'manual', 'generic');
CREATE TYPE "ProviderJobStatus" AS ENUM ('queued', 'processing', 'completed', 'failed', 'unknown');
CREATE TYPE "TargetPublishMode" AS ENUM ('manual_review', 'auto_publish', 'scheduled');

-- Project.installationType string -> enum
ALTER TABLE "Project"
  ALTER COLUMN "installationType" TYPE "InstallationType"
  USING CASE
    WHEN "installationType" = 'vps' THEN 'vps'::"InstallationType"
    WHEN "installationType" = 'shared_hosting' THEN 'shared_hosting'::"InstallationType"
    WHEN "installationType" = 'cloud' THEN 'cloud'::"InstallationType"
    ELSE 'manual'::"InstallationType"
  END;

-- ContentJob.provider string -> enum
ALTER TABLE "ContentJob"
  ALTER COLUMN "provider" TYPE "ContentProvider"
  USING CASE
    WHEN "provider" = 'seowriting' THEN 'seowriting'::"ContentProvider"
    WHEN "provider" = 'manual' THEN 'manual'::"ContentProvider"
    ELSE 'generic'::"ContentProvider"
  END;

-- ContentJob new columns
ALTER TABLE "ContentJob"
  ADD COLUMN "providerJobId" TEXT,
  ADD COLUMN "providerStatus" "ProviderJobStatus" NOT NULL DEFAULT 'unknown',
  ADD COLUMN "targetPublishMode" "TargetPublishMode" NOT NULL DEFAULT 'manual_review',
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastAttemptAt" TIMESTAMP(3);

CREATE INDEX "ContentJob_providerStatus_idx" ON "ContentJob"("providerStatus");
