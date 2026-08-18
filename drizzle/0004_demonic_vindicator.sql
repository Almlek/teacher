CREATE TABLE `exam_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`questionType` varchar(50) NOT NULL DEFAULT 'multiple_choice',
	`prompt` text NOT NULL,
	`options` text,
	`correctAnswer` text,
	`explanation` text,
	`marks` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceLessonId` int,
	`title` varchar(500) NOT NULL,
	`subject` varchar(255),
	`grade` varchar(100),
	`examType` varchar(50) NOT NULL DEFAULT 'comprehensive',
	`instructions` text,
	`durationMinutes` int,
	`totalMarks` int NOT NULL DEFAULT 0,
	`status` varchar(30) NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_settings` ADD `aiProvider` varchar(50) DEFAULT 'gemini';--> statement-breakpoint
ALTER TABLE `user_settings` ADD `defaultExamType` varchar(50) DEFAULT 'comprehensive';--> statement-breakpoint
ALTER TABLE `user_settings` ADD `defaultQuestionTypes` text;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `generationTargets` text;--> statement-breakpoint
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_examId_exams_id_fk` FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exams` ADD CONSTRAINT `exams_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;