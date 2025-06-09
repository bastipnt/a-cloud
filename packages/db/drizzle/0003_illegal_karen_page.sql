ALTER TABLE "files" ADD COLUMN "encryptedFileKey" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "fileKeyNonce" varchar NOT NULL;