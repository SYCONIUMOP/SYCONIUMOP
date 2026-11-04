CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`level` text DEFAULT 'Beginner' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_slug_idx` ON `courses` (`slug`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`enrolled_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_accessed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `course_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `enrollments_course_idx` ON `enrollments` (`course_id`,`enrolled_at`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`video_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`duration_minutes` integer DEFAULT 8 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lessons_course_idx` ON `lessons` (`course_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` text NOT NULL,
	`path` text NOT NULL,
	`referrer_host` text,
	`user_id` text,
	`day_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_views_daily_unique_idx` ON `page_views` (`visitor_id`,`path`,`day_key`);--> statement-breakpoint
CREATE INDEX `page_views_day_idx` ON `page_views` (`day_key`);--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
