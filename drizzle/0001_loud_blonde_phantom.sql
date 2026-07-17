CREATE TABLE `lesson_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`school` varchar(255),
	`teacher` varchar(255),
	`subject` varchar(255) NOT NULL,
	`grade` varchar(100),
	`section` varchar(50),
	`date` varchar(50),
	`period` varchar(100),
	`title` varchar(500) NOT NULL,
	`language` varchar(10) DEFAULT 'ar',
	`contentSource` varchar(50) DEFAULT 'title',
	`aiModel` varchar(100) DEFAULT 'gemini-1.5-flash',
	`content` text,
	`boardContent` text,
	`audioContent` text,
	`summaryContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`fileName` varchar(500),
	`fileUrl` text,
	`fileKey` varchar(500),
	`fileSize` int,
	`subject` varchar(255),
	`grade` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `library_books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`theme` varchar(50) DEFAULT 'purple',
	`fontSize` varchar(20) DEFAULT 'medium',
	`fontFamily` varchar(100) DEFAULT 'cairo',
	`defaultLanguage` varchar(10) DEFAULT 'ar',
	`defaultModel` varchar(100) DEFAULT 'gemini-1.5-flash',
	`defaultSchool` varchar(255),
	`defaultTeacher` varchar(255),
	`defaultDirectorate` varchar(255),
	`defaultSubject` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `lesson_plans` ADD CONSTRAINT `lesson_plans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `library_books` ADD CONSTRAINT `library_books_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;