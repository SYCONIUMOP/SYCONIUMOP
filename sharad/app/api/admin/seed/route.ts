import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { isSiteAdmin, saveUser, starterCourses } from "../../../../lib/lms";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!env.DB) return Response.json({ error: "Database is not connected." }, { status: 503 });
  const user = await getChatGPTUser();
  if (!user || !isSiteAdmin(user)) return Response.json({ error: "Admin access required." }, { status: 403 });
  await saveUser(user);

  const statements = [];
  for (const course of starterCourses) {
    statements.push(
      env.DB.prepare(
        `INSERT OR IGNORE INTO courses (id, slug, title, description, category, level, status)
         VALUES (?, ?, ?, ?, ?, ?, 'published')`,
      ).bind(course.id, course.slug, course.title, course.description, course.category, course.level),
    );
    for (const [index, lesson] of course.lessons.entries()) {
      statements.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO lessons (id, course_id, title, content, sort_order, duration_minutes)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).bind(lesson.id, course.id, lesson.title, lesson.content, index + 1, lesson.duration),
      );
    }
  }
  await env.DB.batch(statements);
  return Response.json({ ok: true, coursesCreated: starterCourses.length });
}
