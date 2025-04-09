CREATE TABLE "files" (
	"fileId" varchar PRIMARY KEY NOT NULL,
	"ownerId" varchar NOT NULL,
	"fileDecryptionHeader" varchar NOT NULL,
	"thumbnailDecryptionHeader" varchar,
	"metadataDecryptionHeader" varchar NOT NULL,
	"encryptedMetadata" varchar NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keys" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"keyEncryptionKeySalt" varchar NOT NULL,
	"encryptedMainKey" varchar NOT NULL,
	"mainKeyNonce" varchar NOT NULL,
	"encryptedMainKeyWithRecoveryKey" varchar NOT NULL,
	"mainKeyWithRecoveryKeyNonce" varchar NOT NULL,
	"encryptedRecoveryKey" varchar NOT NULL,
	"recoveryKeyNonce" varchar NOT NULL,
	"encryptedPrivateKey" varchar NOT NULL,
	"privateKeyNonce" varchar NOT NULL,
	"publicKey" varchar NOT NULL,
	"memLimit" integer NOT NULL,
	"opsLimit" integer NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otts" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"ott" varchar NOT NULL,
	"createdAt" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srps" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"srpSalt" varchar NOT NULL,
	"srpVerifier" varchar NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"encryptedEmail" varchar NOT NULL,
	"emailNonce" varchar NOT NULL,
	"emailHash" varchar NOT NULL,
	"hasTwoFactorEnabled" boolean NOT NULL,
	"hasEmailVerified" boolean NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "users_encryptedEmail_unique" UNIQUE("encryptedEmail")
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_ownerId_users_userId_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otts" ADD CONSTRAINT "otts_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srps" ADD CONSTRAINT "srps_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;