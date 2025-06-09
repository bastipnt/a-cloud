ALTER TABLE "files" ALTER COLUMN "fileDecryptionHeader" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "parentId" varchar;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "isDir" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "isLocal" boolean NOT NULL;