CREATE TABLE `product_analytics` (
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
CREATE INDEX `idx_product_date` ON `product_analytics` (`productId`,`eventDate`);