"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  enrolled: number;
  lesson_count: number;
  completed_count: number;
};

export function DashboardClient({
  displayName,
  email,
  isAdmin,
  signOutHref,
}: {
  displayName: string;
  email: string;
  isAdmin: boolean;
  signOutHref: string;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCourse, setBusyCourse] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    try {
      const response = await fetch("/api/student/dashboard", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load your courses.");
      setCourses(data.courses ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function enroll(course: Course) {
    setBusyCourse(course.id);
    setError("");
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not join this course.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join this course.");
    } finally {
      setBusyCourse(null);
    }
  }

  const enrolledCourses = courses.filter((course) => Boolean(course.enrolled));
  const overallLessons = enrolledCourses.reduce((total, course) => total + Number(course.lesson_count), 0);
  const doneLessons = enrolledCourses.reduce((total, course) => total + Number(course.completed_count), 0);

  return (
    <main className="app-shell">
      <header className="app-topbar"><div className="container nav-inner"><Link className="brand" href="/"><span className="brand-mark">SP</span><span>SHARAD PANDEY</span></Link><div className="app-top-actions">{isAdmin && <Link className="text-link" href="/admin">Admin dashboard ↗</Link>}<a className="button button-light button-small" href={signOutHref} target="_top">Sign out</a></div></div></header>
      <section className="dashboard-intro container"><span className="eyebrow">YOUR LEARNING SPACE</span><h1>Welcome back,<br /><em>{displayName.split("@")[0]}.</em></h1><p>Keep building your skills, one practical lesson at a time.</p><div className="profile-line"><span className="profile-avatar">{displayName.trim().charAt(0).toUpperCase() || "S"}</span><span><b>{displayName}</b><small>{email}</small></span><span className="profile-level">LEARN · BUILD · GROW</span></div></section>
      <section className="container student-overview"><div className="overview-card overview-highlight"><span>COURSES IN PROGRESS</span><strong>{enrolledCourses.length}</strong><small>Your active learning paths</small></div><div className="overview-card"><span>LESSONS COMPLETED</span><strong>{doneLessons}<i> / {overallLessons}</i></strong><small>Across your enrolled courses</small></div><div className="overview-card"><span>OVERALL PROGRESS</span><strong>{overallLessons ? Math.round((doneLessons / overallLessons) * 100) : 0}<i>%</i></strong><div className="mini-progress"><span style={{ width: `${overallLessons ? Math.round((doneLessons / overallLessons) * 100) : 0}%` }} /></div></div></section>
      <section className="container dashboard-courses"><div className="section-heading"><div><span className="eyebrow">YOUR LEARNING PATHS / 01</span><h2>Choose what to <em>build next.</em></h2></div><p>Your progress saves to your account and follows you across devices.</p></div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        {loading ? <div className="loading-card">Loading your courses…</div> : courses.length ? <div className="course-grid">{courses.map((course, index) => { const enrolled = Boolean(course.enrolled); const lessonCount = Number(course.lesson_count); const completeCount = Number(course.completed_count); const progress = lessonCount ? Math.round((completeCount / lessonCount) * 100) : 0; return <article className={`course-card course-accent-${index % 3}`} key={course.id}><div className="course-card-top"><span>{course.category.toUpperCase()}</span><span className="course-icon">{["↗", "⌘", "✳"][index % 3]}</span></div><div className="course-art"><span className="art-shape" /><span className="art-caption">{course.level.toUpperCase()}</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-meta"><span>{lessonCount} practical lessons</span><span>{enrolled ? `${progress}% complete` : course.level}</span></div>{enrolled && <div className="course-progress"><span style={{ width: `${progress}%` }} /></div>}{enrolled ? <Link className="course-link" href={`/learn/${course.slug}`}>{progress ? "Continue learning" : "Start learning"} <span>↗</span></Link> : <button className="course-link course-button-link" onClick={() => void enroll(course)} disabled={busyCourse === course.id}>{busyCourse === course.id ? "Joining…" : "Join this path"}<span>↗</span></button>}</article>;})}</div> : <div className="course-empty"><div className="empty-illustration">✳</div><h3>Your courses will appear here</h3><p>The administrator is preparing the first learning paths. Check back soon.</p>{isAdmin && <Link className="button button-dark" href="/admin">Set up the LMS ↗</Link>}</div>}
      </section>
      <footer className="site-footer"><div className="container footer-row"><Link className="brand" href="/"><span className="brand-mark">SP</span><span>SHARAD PANDEY</span></Link><span>Progress saves automatically after each lesson.</span><Link href="/">Back to website ↗</Link></div></footer>
    </main>
  );
}
