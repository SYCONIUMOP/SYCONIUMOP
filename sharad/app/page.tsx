import Link from "next/link";
import { env } from "cloudflare:workers";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";
type Course = { id: string; slug: string; title: string; description: string; category: string; level: string; lesson_count: number };
const photo = (id: string, width = 900) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=" + width + "&q=84";
const photos = [
  photo("photo-1758270705518-b61b40527e76", 1800),
  photo("photo-1521737711867-e3b97375f902"),
  photo("photo-1522202176988-66273c2fd55f"),
  photo("photo-1516321318423-f06f85e504b3"),
  photo("photo-1503676260728-1c00da094a0b"),
  photo("photo-1517841905240-472988babdf9"),
  photo("photo-1455390582262-044cdead277a"),
  photo("photo-1498050108023-c5249f4df085"),
  photo("photo-1544717305-2782549b5136"),
];
const audiences = [
  ["New to digital skills", "Start with clear foundations and practical first steps.", "✳"],
  ["Working professionals", "Add useful skills that complement the work you already do.", "⌘"],
  ["Freelancers", "Shape your service, build proof, and prepare for better clients.", "↗"],
  ["Future founders", "Turn what you know into a focused offer and direction.", "◈"],
];
const insights = [
  ["Choose a skill with a clear goal", "Start with the work you want to be able to do.", photos[2]],
  ["Make your website easy to follow", "Clear pages help visitors understand their next step.", photos[3]],
  ["Build a portfolio as you learn", "Small projects can show what you know how to do.", photos[1]],
  ["Turn your experience into an offer", "Connect your skills to a problem people value.", photos[4]],
];
function Heading({ label, title, accent, description }: { label: string; title: string; accent: string; description: string }) {
  return <div className="home-v2-heading" data-reveal><span className="home-v2-label"><i />{label}</span><h2>{title} <em>{accent}</em></h2><p>{description}</p></div>;
}

export default async function Home() {
  const user = await getChatGPTUser();
  let courses: Course[] = [];
  if (env.DB) {
    try {
      const result = await env.DB.prepare("SELECT c.id,c.slug,c.title,c.description,c.category,c.level,(SELECT COUNT(*) FROM lessons l WHERE l.course_id=c.id) AS lesson_count FROM courses c WHERE c.status='published' ORDER BY c.category,c.title").all<Course>();
      courses = result.results ?? [];
    } catch { courses = []; }
  }
  const lessonCount = courses.reduce((total, course) => total + Number(course.lesson_count || 0), 0);
  const access = user ? "/dashboard" : chatGPTSignInPath("/dashboard");
  return <main className="home-v2">
    <header className="home-v2-nav"><div className="home-v2-nav-inner">
      <Link className="home-v2-brand" href="/" aria-label="Sharad Pandey home"><span>SP</span><b>SHARAD PANDEY</b></Link>
      <nav aria-label="Main navigation"><a href="#courses">Courses</a><a href="#experience">Our approach</a><a href="#freelance">Freelance</a><a href="#events">Events</a><a href="#resources">Resources</a></nav>
      <div className="home-v2-nav-actions">{user ? <Link className="home-v2-nav-button" href="/dashboard">My learning ↗</Link> : <a className="home-v2-nav-button" href={access} target="_top">Student sign in ↗</a>}{user && <a className="home-v2-signout" href={chatGPTSignOutPath("/")} target="_top">Sign out</a>}</div>
    </div></header>

    <section className="home-v2-hero">
      <div className="home-v2-hero-copy" data-reveal><span className="home-v2-label"><i /> LEARN · BUILD · GROW</span><h1>Shape your success.<br />Explore courses that<br /><em>elevate your life.</em></h1><svg className="home-v2-wave animated-line" viewBox="0 0 380 28" aria-hidden="true"><path d="M4 16 C60 6 111 23 170 13 S276 8 376 14" /></svg><p>Practical skills and clear learning paths to help you move forward.</p><div className="home-v2-actions"><a className="home-v2-button home-v2-button-yellow" href="#courses">Explore courses <span>↗</span></a>{user ? <Link className="home-v2-button home-v2-button-white" href="/dashboard">Open my learning</Link> : <a className="home-v2-button home-v2-button-white" href={access} target="_top">Student sign in</a>}</div></div>
      <div className="home-v2-hero-image" data-reveal><img src={photos[0]} alt="Learners sharing ideas during a study session" /><span className="home-v2-image-tag home-v2-image-tag-left"><b>{courses.length || 3}</b> learning paths</span><span className="home-v2-image-tag home-v2-image-tag-right"><i>✳</i> Learn at your pace</span><span className="home-v2-image-mark">SP<small>LEARN<br />TO BUILD</small></span><span className="home-v2-image-spark" aria-hidden="true">✳</span></div>
    </section>

    <section className="home-v2-stats" aria-label="Learning platform highlights"><div className="home-v2-stats-intro"><span>✦</span><b>By the numbers,<br />our learning space</b></div><div className="home-v2-stat"><strong>{courses.length || 3}</strong><span>learning paths</span></div><div className="home-v2-stat home-v2-stat-yellow"><strong>{lessonCount || 13}</strong><span>practical lessons</span></div><div className="home-v2-stat home-v2-stat-lilac"><strong>24/7</strong><span>learn at your pace</span></div></section>

    <section className="home-v2-courses" id="courses"><Heading label="FIND YOUR STARTING POINT" title="Empower your" accent="skills." description="Discover practical courses designed to help you learn, build, and move your work forward."/><div className="home-v2-course-grid">{courses.map((course, index) => <article className="home-v2-course" key={course.id} data-reveal><Link className="home-v2-course-image" href={access} target={user ? undefined : "_top"}><img src={photos[1 + index % 3]} alt="" /><span className="home-v2-level">{course.level}</span><span className="home-v2-card-arrow">↗</span></Link><div className="home-v2-course-copy"><span className="home-v2-course-category">{course.category}</span><h3>{course.title}</h3><p>{course.description}</p><div><span>{course.lesson_count} lessons</span><Link href={access} target={user ? undefined : "_top"}>{user ? "Explore path" : "View learning path"} ↗</Link></div></div></article>)}</div></section>

    <section className="home-v2-experience" id="experience">
      <div className="home-v2-experience-intro" data-reveal><span className="home-v2-label"><i /> YOUR NEXT CHAPTER</span><h2>Skills that fit<br /><em>real life.</em></h2><p>Learn at your pace, practice with purpose, and track your progress as you grow.</p><Link className="home-v2-text-link" href={access} target={user ? undefined : "_top"}>Start learning <span>↗</span></Link></div>
      <div className="home-v2-highlight" data-reveal><span className="home-v2-flower">✳</span><small>LEARN WITH PURPOSE</small><h3>Give your skills room to grow.</h3><p>Use what you learn to create a portfolio, strengthen your offer, or take a first step into a new opportunity.</p><Link className="home-v2-button home-v2-button-purple" href={access} target={user ? undefined : "_top"}>Find your path ↗</Link></div>
      <div className="home-v2-steps" data-reveal><h3>A clear next step, at every stage.</h3><ul><li><span>01</span><div><b>Choose a learning path</b><p>Start with a skill that supports your goal.</p></div></li><li><span>02</span><div><b>Practice on useful work</b><p>Turn new ideas into something you can show.</p></div></li><li><span>03</span><div><b>Track your progress</b><p>Save completed lessons to your account.</p></div></li></ul></div>
    </section>

    <section className="home-v2-freelance" id="freelance">
      <div className="home-v2-freelance-copy" data-reveal><span className="home-v2-label"><i /> SKILLS THAT SELL</span><h2>Turn your skills into <em>paid work.</em></h2><p>Shape a clear freelance offer, show clients the value of your work, and build a practical path toward better projects.</p><div className="home-v2-freelance-steps"><span><b>01</b> Package your skill</span><span><b>02</b> Present your value</span><span><b>03</b> Grow client work</span></div><Link className="home-v2-button home-v2-button-yellow" href={access} target={user ? undefined : "_top"}>Explore freelance learning <span>↗</span></Link></div>
      <div className="home-v2-freelance-stage" data-reveal data-scroll data-scroll-speed="0.08" aria-label="Illustration of a freelancer receiving a sample payment in US dollars">
        <img src={photos[6]} alt="Freelancer working on a laptop at a desk" />
        <div className="home-v2-freelance-shade" />
        <div className="home-v2-offer-chip"><span>YOUR SERVICE</span><b>Landing page design</b><i>✦</i></div>
        <div className="home-v2-payment-card"><span className="home-v2-payment-state"><i>✓</i> PAYMENT RECEIVED</span><strong><small>$</small>1,250<span>.00</span></strong><p>Website strategy project</p><div><span>USD · SAMPLE PAYMENT</span><b>↗</b></div></div>
        <div className="home-v2-client-chip"><span className="home-v2-client-avatar">A</span><span><b>New client inquiry</b><small>Brand website refresh</small></span><i>↗</i></div>
        <span className="home-v2-dollar-float home-v2-dollar-one" aria-hidden="true">$</span><span className="home-v2-dollar-float home-v2-dollar-two" aria-hidden="true">$</span>
        <svg className="home-v2-payment-line animated-line" viewBox="0 0 520 220" aria-hidden="true"><path d="M10 180 C120 30 185 225 292 114 S414 28 510 52" /></svg>
      </div>
    </section>

    <section className="home-v2-community"><div className="home-v2-community-heading"><span className="home-v2-label"><i /> LEARN TOGETHER</span><h2>A community of curious <em>builders.</em></h2><p>Different starting points. Shared momentum.</p></div><div className="home-v2-community-strip"><article><img src={photos[1]} alt="Learners working together" /><b>Share what you’re building</b></article><article><img src={photos[5]} alt="Learner smiling" /><b>Grow with practice</b></article><article><img src={photos[4]} alt="Students learning together" /><b>Learn from each step</b></article><div className="home-v2-quote"><strong>“Your next step starts with what you know.”</strong><span>LEARN · BUILD · GROW</span></div></div></section>

    <section className="home-v2-events" id="events"><Heading label="LIVE LEARNING" title="Events and" accent="community." description="Learning sessions will be announced here. Dates are coming soon."/><div className="home-v2-event-list"><article><span>✦</span><div><h3>Career Q&amp;A session</h3><p>Explore career paths and bring your practical questions.</p></div><small>DATES COMING SOON</small></article><article><span>⌘</span><div><h3>Portfolio review</h3><p>Learn how to present your work with clarity.</p></div><small>DATES COMING SOON</small></article><article><span>↗</span><div><h3>Digital skills workshop</h3><p>Practice a skill through a focused session.</p></div><small>DATES COMING SOON</small></article></div></section>

    <section className="home-v2-audience"><Heading label="A PLACE FOR EVERY LEARNER" title="Start where" accent="you are." description="Build a foundation, add new skills, or make your experience work harder for you."/><div className="home-v2-audience-grid">{audiences.map(([title, copy, icon], index) => <article key={title} data-reveal><span className="home-v2-audience-number">0{index + 1}</span><span className="home-v2-audience-icon">{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="home-v2-resources" id="resources"><Heading label="KEEP BUILDING" title="Explore your" accent="next step." description="Choose a learning path built around skills you can put into practice."/><div className="home-v2-resource-grid">{courses.map((course, index) => <Link className="home-v2-resource" href={access} target={user ? undefined : "_top"} key={course.id} data-reveal><div><img src={photos[6 + index]} alt="" /><span>{course.category}</span></div><h3>{course.title}</h3><p>{course.description}</p><b>Explore path <span>↗</span></b></Link>)}</div></section>

    <section className="home-v2-reads"><Heading label="IDEAS FOR YOUR JOURNEY" title="From the learning" accent="desk." description="Practical prompts to help turn learning into action."/><div className="home-v2-read-grid">{insights.map(([title, copy, src], index) => <article className="home-v2-read" key={title} data-reveal><div className="home-v2-read-image"><img src={src} alt="" /><span>{index % 2 === 0 ? "LEARN" : "BUILD"}</span></div><div><span>LEARN · BUILD · GROW</span><h3>{title}</h3><p>{copy}</p><Link href={access} target={user ? undefined : "_top"}>Explore lessons <b>↗</b></Link></div></article>)}</div></section>

    <section className="home-v2-weekly"><span className="home-v2-label"><i /> A SMALL STEP EACH WEEK</span><h2>Weekly insights await.</h2><p>Choose a focus and head into the learning space.</p><div><a href="#courses">Marketing</a><a href="#courses">Website building</a><a href="#courses">Freelancing</a><Link href={access} target={user ? undefined : "_top"}>Open learner space ↗</Link></div></section>

    <footer className="home-v2-footer"><div className="home-v2-footer-main"><Link className="home-v2-brand" href="/"><span>SP</span><b>SHARAD PANDEY</b></Link><p>Practical learning for what comes next.</p><Link className="home-v2-footer-cta" href="/login">Join us ↗</Link></div><nav><a href="#courses">Courses</a><a href="#experience">About</a><a href="#events">Events</a><a href="#resources">Resources</a><Link href="/dashboard">Student space</Link><Link href="/admin">Admin</Link></nav><div className="home-v2-footer-bottom"><span>© {new Date().getFullYear()} Sharad Pandey · Learn · Build · Grow</span><span>Student progress is saved to your account.</span></div></footer>
  </main>;
}
