import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { saveUser } from "../../../../lib/lms";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!env.DB) return Response.json({ error: "Database is not connected." }, { status: 503 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  await saveUser(user);

  const result = await env.DB.prepare(
    `SELECT c.id, c.slug, c.title, c.description, c.category, c.level,
       EXISTS(SELECT 1 FROM enrollments e WHERE e.user_id = ? AND e.course_id = c.id) AS enrolled,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
       (SELECT COUNT(*) FROM lesson_progress p JOIN lessons l ON l.id = p.lesson_id
        WHERE p.user_id = ? AND l.course_id = c.id) AS completed_count
     FROM courses c WHERE c.status = 'published' ORDER BY c.category, c.title`,
  ).bind(user.userId, user.userId).all();

  return Response.json({ user: { displayName: user.displayName, email: user.email }, courses: result.results ?? [] });
}
