CREATE TABLE `custom_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`fieldType` enum('text','textarea','number','select') NOT NULL DEFAULT 'text',
	`displayOrder` int NOT NULL DEFAULT 0,
	`isRequired` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `display_layout` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gridCount` int NOT NULL DEFAULT 6,
	`carouselMode` enum('single','6items','8items','static') NOT NULL DEFAULT '6items',
	`intervalSeconds` int NOT NULL DEFAULT 8,
	`selectedProductIds` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `display_layout_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marquee` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`scrollSpeed` int NOT NULL DEFAULT 50,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marquee_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_field_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`fieldId` int NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_field_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_tags` (
	`productId` int NOT NULL,
	`tagId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`imageUrl` text,
	`videoUrl` text,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#FFB703',
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_field_values` ADD CONSTRAINT `product_field_values_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_field_values` ADD CONSTRAINT `product_field_values_fieldId_custom_fields_id_fk` FOREIGN KEY (`fieldId`) REFERENCES `custom_fields`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_productId_tagId_products_id_id_fk` FOREIGN KEY (`productId`,`tagId`) REFERENCES `products`(`id`,`id`) ON DELETE no action ON UPDATE no action;ALTER TABLE `product_tags` DROP FOREIGN KEY `product_tags_productId_tagId_products_id_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE no action ON UPDATE no action;CREATE TABLE `product_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`eventType` enum('impression','click') NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_field_values` DROP FOREIGN KEY `product_field_values_productId_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_field_values` DROP FOREIGN KEY `product_field_values_fieldId_custom_fields_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_tags` DROP FOREIGN KEY `product_tags_productId_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_tags` DROP FOREIGN KEY `product_tags_tagId_tags_id_fk`;
--> statement-breakpoint
ALTER TABLE `custom_fields` MODIFY COLUMN `isRequired` enum('true','false') NOT NULL DEFAULT 'false';--> statement-breakpoint
ALTER TABLE `display_layout` MODIFY COLUMN `selectedProductIds` text NOT NULL DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `marquee` MODIFY COLUMN `isActive` enum('true','false') NOT NULL DEFAULT 'true';--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `price` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `isActive` enum('true','false') NOT NULL DEFAULT 'true';--> statement-breakpoint
ALTER TABLE `product_tags` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `product_tags` ADD `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `product_tags` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD CONSTRAINT `tags_name_unique` UNIQUE(`name`);--> statement-breakpoint
CREATE INDEX `idx_product_date` ON `product_analytics` (`productId`,`eventDate`);ALTER TABLE `products` ADD `displayOrder` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `isPinned` enum('true','false') DEFAULT 'false' NOT NULL;ALTER TABLE `products` ADD `category` enum('food','beverage','dessert','restaurant','apparel','beauty','home','electronics') DEFAULT 'food' NOT NULL;