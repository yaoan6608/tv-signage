ALTER TABLE `product_tags` DROP FOREIGN KEY `product_tags_productId_tagId_products_id_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE no action ON UPDATE no action;