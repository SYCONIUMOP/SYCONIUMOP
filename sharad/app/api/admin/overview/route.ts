import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { isSiteAdmin, saveUser } from "../../../../lib/lms";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!env.DB) return Response.json({ error: "Database is not connected." }, { status: 503 });
  const user = await getChatGPTUser();
  if (!user || !isSiteAdmin(user)) return Response.json({ error: "Admin access required." }, { status: 403 });
  await saveUser(user);
  const db = env.DB;

  const [students, activeStudents, views, uniqueVisitors, enrollments, completed, courseCount, daily, pages, progress] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'student'").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'student' AND last_login_at >= datetime('now', '-7 days')").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM page_views").first<{ total: number }>(),
    db.prepare("SELECT COUNT(DISTINCT visitor_id) AS total FROM page_views").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM enrollments").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM lesson_progress").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) AS total FROM courses WHERE status = 'published'").first<{ total: number }>(),
    db.prepare(
      `SELECT day_key AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
       FROM page_views WHERE day_key >= date('now', '-13 days') GROUP BY day_key ORDER BY day_key`,
    ).all(),
    db.prepare(
      `SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
       FROM page_views GROUP BY path ORDER BY views DESC LIMIT 8`,
    ).all(),
    db.prepare(
      `SELECT u.user_id, u.display_name, u.email, u.last_login_at, c.id AS course_id,
         c.title AS course_title,
         (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
         (SELECT COUNT(*) FROM lesson_progress p JOIN lessons l ON l.id = p.lesson_id
           WHERE p.user_id = u.user_id AND l.course_id = c.id) AS completed_count
       FROM users u JOIN enrollments e ON e.user_id = u.user_id
       JOIN courses c ON c.id = e.course_id
       WHERE u.role = 'student' ORDER BY u.last_login_at DESC LIMIT 100`,
    ).all(),
  ]);

  const rows = (progress.results ?? []) as Array<Record<string, unknown>>;
  return Response.json({
    stats: {
      students: students?.total ?? 0,
      activeStudents: activeStudents?.total ?? 0,
      pageViews: views?.total ?? 0,
      uniqueVisitors: uniqueVisitors?.total ?? 0,
      enrollments: enrollments?.total ?? 0,
      lessonsCompleted: completed?.total ?? 0,
      publishedCourses: courseCount?.total ?? 0,
    },
    daily: daily.results ?? [],
    pages: pages.results ?? [],
    learners: rows.map((row) => ({
      userId: row.user_id,
      name: row.display_name,
      email: row.email,
      lastActive: row.last_login_at,
      course: row.course_title,
      completed: Number(row.completed_count ?? 0),
      total: Number(row.lesson_count ?? 0),
    })),
  });
}
