import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { saveUser } from "../../../lib/lms";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!env.DB) return Response.json({ error: "Database is not connected." }, { status: 503 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const courseId = new URL(request.url).searchParams.get("courseId") ?? "";
  const enrolled = await env.DB.prepare("SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?")
    .bind(user.userId, courseId).first();
  if (!enrolled) return Response.json({ error: "Enroll in this course to view progress." }, { status: 403 });
  const rows = await env.DB.prepare(
    `SELECT p.lesson_id, p.completed_at FROM lesson_progress p
     JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = ? AND l.course_id = ?`,
  ).bind(user.userId, courseId).all();
  return Response.json({ completed: rows.results ?? [] });
}

export async function POST(request: Request) {
  if (!env.DB) return Response.json({ error: "Database is not connected." }, { status: 503 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  let payload: { lessonId?: string; completed?: boolean };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const lessonId = payload.lessonId?.trim() ?? "";
  if (!/^[a-z0-9-]{2,80}$/.test(lessonId) || typeof payload.completed !== "boolean") {
    return Response.json({ error: "Choose a valid lesson and progress state." }, { status: 400 });
  }
  const enrollment = await env.DB.prepare(
    `SELECT e.course_id FROM enrollments e JOIN lessons l ON l.course_id = e.course_id
     WHERE e.user_id = ? AND l.id = ? LIMIT 1`,
  ).bind(user.userId, lessonId).first<{ course_id: string }>();
  if (!enrollment) return Response.json({ error: "Enroll in the course first." }, { status: 403 });
  await saveUser(user);

  if (payload.completed) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)`,
    ).bind(user.userId, lessonId).run();
  } else {
    await env.DB.prepare("DELETE FROM lesson_progress WHERE user_id = ? AND lesson_id = ?")
      .bind(user.userId, lessonId).run();
  }
  await env.DB.prepare(
    `UPDATE enrollments SET last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?`,
  ).bind(user.userId, enrollment.course_id).run();

  return Response.json({ ok: true });
}
