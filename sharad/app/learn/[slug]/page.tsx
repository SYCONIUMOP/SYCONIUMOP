import { env } from "cloudflare:workers";
import { notFound, redirect } from "next/navigation";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { saveUser } from "../../../lib/lms";
import { LessonPlayer } from "../../components/lesson-player";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const user = await requireChatGPTUser(`/learn/${slug}`);
  if (!env.DB) return <main className="container course-empty"><h1>Learning is getting ready</h1><p>The course database has not been connected yet.</p></main>;
  await saveUser(user);
  const course = await env.DB.prepare(
    "SELECT id, slug, title, category, level FROM courses WHERE slug = ? AND status = 'published'",
  ).bind(slug).first<{ id: string; slug: string; title: string; category: string; level: string }>();
  if (!course) notFound();
  const enrollment = await env.DB.prepare("SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?")
    .bind(user.userId, course.id).first();
  if (!enrollment) redirect("/dashboard");
  const lessonRows = await env.DB.prepare(
    `SELECT id, title, content, video_url, duration_minutes FROM lessons
     WHERE course_id = ? ORDER BY sort_order, id`,
  ).bind(course.id).all<{ id: string; title: string; content: string; video_url: string | null; duration_minutes: number }>();
  await env.DB.prepare("UPDATE enrollments SET last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?")
    .bind(user.userId, course.id).run();

  return <LessonPlayer course={course} lessons={lessonRows.results ?? []} />;
}
