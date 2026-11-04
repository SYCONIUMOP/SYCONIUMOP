"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Overview = {
  stats: { students: number; activeStudents: number; pageViews: number; uniqueVisitors: number; enrollments: number; lessonsCompleted: number; publishedCourses: number };
  daily: Array<{ day: string; views: number; visitors: number }>;
  pages: Array<{ path: string; views: number; visitors: number }>;
  learners: Array<{ userId: string; name: string; email: string; lastActive: string; course: string; completed: number; total: number }>;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export function AdminDashboard({ displayName }: { displayName: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      let response = await fetch("/api/admin/overview", { cache: "no-store" });
      let next = await response.json();
      if (!response.ok) throw new Error(next.error || "Could not load the dashboard.");
      if (!next.stats.publishedCourses) {
        await fetch("/api/admin/seed", { method: "POST" });
        response = await fetch("/api/admin/overview", { cache: "no-store" });
        next = await response.json();
        if (!response.ok) throw new Error(next.error || "Could not initialize the LMS.");
      }
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  const maxViews = Math.max(1, ...(data?.daily.map((day) => Number(day.views)) ?? []));

  return <div className="container admin-wrap">
    <div className="admin-heading"><div><span className="eyebrow">LEARNING MANAGEMENT / ADMIN</span><h1>Good to see you,<br /><em>{displayName.split("@")[0]}.</em></h1><p>See who’s learning, what they’re working through, and how people find your site.</p></div><Link className="button button-dark" href="/">View website ↗</Link></div>
    {error && <div className="form-alert" role="alert">{error}<button onClick={() => void load()}>Try again</button></div>}
    {loading ? <div className="loading-card">Loading your LMS dashboard…</div> : data && <>
      <section className="admin-stat-grid"><article className="admin-stat admin-stat-purple"><span>STUDENTS</span><strong>{data.stats.students}</strong><small>{data.stats.activeStudents} signed in during the last 7 days</small></article><article className="admin-stat"><span>WEBSITE VISITS</span><strong>{data.stats.pageViews}</strong><small>{data.stats.uniqueVisitors} unique browsers, all time</small></article><article className="admin-stat"><span>COURSE ENROLMENTS</span><strong>{data.stats.enrollments}</strong><small>{data.stats.publishedCourses} published learning paths</small></article><article className="admin-stat"><span>LESSONS COMPLETED</span><strong>{data.stats.lessonsCompleted}</strong><small>Across all students</small></article></section>
      <section className="admin-grid"><article className="admin-panel"><div className="panel-title"><div><span className="eyebrow">TRAFFIC / LAST 14 DAYS</span><h2>People are finding you.</h2></div><span className="panel-chip">FIRST-PARTY ANALYTICS</span></div><div className="chart-bars">{data.daily.length ? data.daily.map((day) => <div className="chart-column" key={day.day} title={`${day.views} page views · ${day.visitors} visitors`}><span className="bar-count">{day.views}</span><div className="bar-track"><i style={{ height: `${Math.max(3, (Number(day.views) / maxViews) * 100)}%` }} /></div><small>{dateLabel(day.day)}</small></div>) : <p className="empty-note">Visit counts will appear here as people browse the site.</p>}</div></article><article className="admin-panel"><div className="panel-title"><div><span className="eyebrow">MOST VISITED</span><h2>Popular pages</h2></div></div>{data.pages.length ? <div className="popular-pages">{data.pages.map((page) => <div className="popular-page" key={page.path}><span>{page.path}</span><b>{page.views}</b></div>)}</div> : <p className="empty-note">No page visits recorded yet.</p>}<p className="privacy-note">Counts use a random browser ID. No IP addresses are stored.</p></article></section>
      <section className="admin-panel learner-panel"><div className="panel-title"><div><span className="eyebrow">STUDENT PROGRESS</span><h2>Who’s learning what.</h2></div><span className="panel-chip">COURSE LEVEL</span></div>{data.learners.length ? <div className="table-scroll"><table className="learner-table"><thead><tr><th>Student</th><th>Learning path</th><th>Progress</th><th>Last active</th></tr></thead><tbody>{data.learners.map((student) => { const percent = student.total ? Math.round((student.completed / student.total) * 100) : 0; return <tr key={`${student.userId}-${student.course}`}><td><b>{student.name}</b><small>{student.email}</small></td><td>{student.course}</td><td><div className="table-progress"><span>{student.completed}/{student.total} lessons · {percent}%</span><i><b style={{ width: `${percent}%` }} /></i></div></td><td>{student.lastActive ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(`${student.lastActive.replace(" ", "T")}Z`)) : "—"}</td></tr>;})}</tbody></table></div> : <div className="empty-row"><span className="empty-illustration">✳</span><div><b>No student progress yet</b><p>Once learners sign in and join a course, their progress will show here.</p></div></div>}</section>
    </>}
    <footer className="site-footer"><div className="footer-row"><span>Student data and course progress are visible only to the site administrator.</span><Link href="/dashboard">Student view ↗</Link></div></footer>
  </div>;
}
