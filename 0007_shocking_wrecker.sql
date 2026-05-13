ALTER TABLE `custom_fields` MODIFY COLUMN `isRequired` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `custom_fields` MODIFY COLUMN `isRequired` tinyint NOT NULL DEFAULT 0;