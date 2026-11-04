"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lesson = { id: string; title: string; content: string; video_url: string | null; duration_minutes: number };

export function LessonPlayer({
  course,
  lessons,
}: {
  course: { id: string; slug: string; title: string; category: string; level: string };
  lessons: Lesson[];
}) {
  const [selected, setSelected] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState("");
  const lesson = lessons[selected];
  const percent = useMemo(() => lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0, [completed.length, lessons.length]);

  useEffect(() => {
    fetch(`/api/progress?courseId=${encodeURIComponent(course.id)}`, { cache: "no-store" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => setCompleted((data.completed ?? []).map((row: { lesson_id: string }) => row.lesson_id)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Progress could not be loaded."));
  }, [course.id]);

  async function toggleComplete() {
    if (!lesson) return;
    const isCompleted = completed.includes(lesson.id);
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, completed: !isCompleted }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Progress could not be saved."); return; }
    setCompleted((current) => isCompleted ? current.filter((id) => id !== lesson.id) : [...current, lesson.id]);
    setError("");
  }

  return (
    <main className="app-shell">
      <header className="app-topbar"><div className="container nav-inner"><Link className="brand" href="/"><span className="brand-mark">SP</span><span>SHARAD PANDEY</span></Link><Link className="text-link" href="/dashboard">← My learning</Link></div></header>
      <div className="container lesson-layout">
        <aside className="lesson-sidebar"><span className="eyebrow">{course.category} · {course.level}</span><h1>{course.title}</h1><div className="lesson-progress-label"><span>COURSE PROGRESS</span><b>{percent}%</b></div><div className="course-progress"><span style={{ width: `${percent}%` }} /></div><nav aria-label="Course lessons" className="lesson-list">{lessons.map((item, index) => <button key={item.id} className={`lesson-nav-item ${selected === index ? "selected" : ""}`} onClick={() => setSelected(index)}><span className={`lesson-check ${completed.includes(item.id) ? "done" : ""}`}>{completed.includes(item.id) ? "✓" : String(index + 1).padStart(2, "0")}</span><span><b>{item.title}</b><small>{item.duration_minutes} min</small></span></button>)}</nav></aside>
        <section className="lesson-main">{lesson ? <><div className="lesson-kicker">LESSON {String(selected + 1).padStart(2, "0")} / {String(lessons.length).padStart(2, "0")}</div><h2>{lesson.title}</h2>{lesson.video_url ? <div className="lesson-video"><video controls src={lesson.video_url} /></div> : <div className="lesson-content">{lesson.content.split("\n\n").map((paragraph, index) => <p key={`${lesson.id}-${index}`}>{paragraph}</p>)}</div>}<div className="lesson-actions"><button className={`button ${completed.includes(lesson.id) ? "button-light" : "button-dark"}`} onClick={() => void toggleComplete()}>{completed.includes(lesson.id) ? "✓ Completed · mark incomplete" : "Mark lesson complete ✓"}</button>{selected < lessons.length - 1 && <button className="text-link" onClick={() => setSelected(selected + 1)}>Next lesson →</button>}</div>{error && <p className="error-text" role="alert">{error}</p>}</> : <div className="course-empty"><h3>No lessons have been added yet</h3><p>Check back after the course content is published.</p></div>}</section>
      </div>
      <footer className="site-footer"><div className="container footer-row"><span>Progress saves to your account.</span><Link href={`/learn/${course.slug}`}>Back to top ↑</Link></div></footer>
    </main>
  );
}
