ALTER TABLE `display_layout` ADD `backgroundColor` varchar(7) DEFAULT '#000000' NOT NULL;--> statement-breakpoint
ALTER TABLE `display_layout` ADD `backgroundImageUrl` text;--> statement-breakpoint
ALTER TABLE `display_layout` ADD `backgroundImageOpacity` int DEFAULT 100 NOT NULL;