import { sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    level: text("level").notNull().default("Beginner"),
    status: text("status").notNull().default("published"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("courses_slug_idx").on(table.slug)],
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    videoUrl: text("video_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    durationMinutes: integer("duration_minutes").notNull().default(8),
  },
  (table) => [
    index("lessons_course_idx").on(table.courseId, table.sortOrder),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "lessons_course_fk",
    }).onDelete("cascade"),
  ],
);

export const enrollments = sqliteTable(
  "enrollments",
  {
    userId: text("user_id").notNull(),
    courseId: text("course_id").notNull(),
    enrolledAt: text("enrolled_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastAccessedAt: text("last_accessed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.courseId] }),
    index("enrollments_course_idx").on(table.courseId, table.enrolledAt),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "enrollments_user_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "enrollments_course_fk",
    }).onDelete("cascade"),
  ],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.lessonId] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "progress_user_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.lessonId],
      foreignColumns: [lessons.id],
      name: "progress_lesson_fk",
    }).onDelete("cascade"),
  ],
);

export const pageViews = sqliteTable(
  "page_views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    visitorId: text("visitor_id").notNull(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host"),
    userId: text("user_id"),
    dayKey: text("day_key").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("page_views_daily_unique_idx").on(
      table.visitorId,
      table.path,
      table.dayKey,
    ),
    index("page_views_day_idx").on(table.dayKey),
  ],
);
