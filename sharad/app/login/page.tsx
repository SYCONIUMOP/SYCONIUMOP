import Link from "next/link";
import { redirect } from "next/navigation";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getChatGPTUser();
  if (user) redirect("/dashboard");
  return <main className="login-wrap"><div className="login-card"><Link className="brand" href="/"><span className="brand-mark">SP</span><span>SHARAD PANDEY</span></Link><span className="eyebrow">STUDENT ACCESS</span><h1>Welcome to<br /><em>your learning space.</em></h1><p>Sign in to join courses, save lesson progress, and continue on any device.</p><a className="button button-dark login-button" href={chatGPTSignInPath("/dashboard")} target="_top">Continue with ChatGPT <span>↗</span></a><small>Sign-in uses your ChatGPT account. Your course progress is saved to your account.</small></div><Link className="login-back" href="/">← Back to Sharad Pandey</Link></main>;
}
