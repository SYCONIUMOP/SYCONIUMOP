import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { saveUser } from "../../../lib/lms";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!env.DB) return Response.json({ error: "Database is not connected." }, { status: 503 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });

  let payload: { courseId?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const courseId = payload.courseId?.trim() ?? "";
  if (!/^[a-z0-9-]{2,80}$/.test(courseId)) return Response.json({ error: "Choose a valid course." }, { status: 400 });

  const course = await env.DB.prepare("SELECT id FROM courses WHERE id = ? AND status = 'published'").bind(courseId).first();
  if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  await saveUser(user);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)`,
  ).bind(user.userId, courseId).run();
  return Response.json({ ok: true });
}
