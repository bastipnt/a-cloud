CREATE TABLE `files` (
	`fileId` text PRIMARY KEY NOT NULL,
	`ownerId` text NOT NULL,
	`fileDecryptionHeader` text NOT NULL,
	`thumbnailDecryptionHeader` text,
	`metadataDecryptionHeader` text NOT NULL,
	`encryptedMetadata` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `keys` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`keyEncryptionKeySalt` text NOT NULL,
	`encryptedMainKey` text NOT NULL,
	`mainKeyNonce` text NOT NULL,
	`encryptedMainKeyWithRecoveryKey` text NOT NULL,
	`mainKeyWithRecoveryKeyNonce` text NOT NULL,
	`encryptedRecoveryKey` text NOT NULL,
	`recoveryKeyNonce` text NOT NULL,
	`encryptedPrivateKey` text NOT NULL,
	`privateKeyNonce` text NOT NULL,
	`publicKey` text NOT NULL,
	`memLimit` integer NOT NULL,
	`opsLimit` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`userId` text PRIMARY KEY NOT NULL,
	`encryptedEmail` text NOT NULL,
	`emailNonce` text NOT NULL,
	`emailHash` text NOT NULL,
	`hasTwoFactorEnabled` integer NOT NULL,
	`hasEmailVerified` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_encryptedEmail_unique` ON `users` (`encryptedEmail`);