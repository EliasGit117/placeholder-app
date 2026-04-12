ALTER TABLE "accounts" RENAME COLUMN "accountId" TO "account_id";
ALTER TABLE "accounts" RENAME COLUMN "providerId" TO "provider_id";
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "accounts" RENAME COLUMN "accessToken" TO "access_token";
ALTER TABLE "accounts" RENAME COLUMN "refreshToken" TO "refresh_token";
ALTER TABLE "accounts" RENAME COLUMN "idToken" TO "id_token";
ALTER TABLE "accounts" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";
ALTER TABLE "accounts" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";
ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "accounts" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "sessions" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "sessions" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "sessions" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "sessions" RENAME COLUMN "ipAddress" TO "ip_address";
ALTER TABLE "sessions" RENAME COLUMN "userAgent" TO "user_agent";
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";

ALTER TABLE "verifications" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "verifications" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "verifications" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER INDEX "accounts_userId_idx" RENAME TO "accounts_user_id_idx";
ALTER TABLE "accounts" RENAME CONSTRAINT "accounts_userId_fkey" TO "accounts_user_id_fkey";
ALTER INDEX "sessions_userId_idx" RENAME TO "sessions_user_id_idx";
ALTER TABLE "sessions" RENAME CONSTRAINT "sessions_userId_fkey" TO "sessions_user_id_fkey";

ALTER TYPE "TodoState" RENAME TO "todo_state";
