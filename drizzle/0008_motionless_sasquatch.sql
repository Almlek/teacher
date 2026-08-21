CREATE TABLE `exam_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`userId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`snapshotJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_bank` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255),
	`grade` varchar(100),
	`questionType` varchar(50) NOT NULL DEFAULT 'multiple_choice',
	`difficulty` varchar(30) NOT NULL DEFAULT 'medium',
	`prompt` text NOT NULL,
	`options` text,
	`correctAnswer` text,
	`explanation` text,
	`imageUrl` text,
	`marks` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `question_bank_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `exam_versions` ADD CONSTRAINT `exam_versions_examId_exams_id_fk` FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_versions` ADD CONSTRAINT `exam_versions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_bank` ADD CONSTRAINT `question_bank_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;