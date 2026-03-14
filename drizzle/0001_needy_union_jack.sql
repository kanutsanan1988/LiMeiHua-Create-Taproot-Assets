CREATE TABLE `token_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`userId` int NOT NULL,
	`txType` enum('mint','burn','transfer','create') NOT NULL,
	`amount` varchar(78) NOT NULL,
	`txHash` varchar(128),
	`fee` int,
	`txStatus` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`initialSupply` varchar(78) NOT NULL,
	`currentSupply` varchar(78) NOT NULL,
	`decimals` int NOT NULL DEFAULT 8,
	`tokenType` enum('fixed','mintable','burnable') NOT NULL,
	`ownerAddress` varchar(512) NOT NULL,
	`assetId` varchar(128),
	`batchTxid` varchar(128),
	`groupKey` varchar(256),
	`estimatedFee` int,
	`actualFee` int,
	`status` enum('pending','minting','confirmed','failed') NOT NULL DEFAULT 'pending',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `lightningAddress` varchar(512);