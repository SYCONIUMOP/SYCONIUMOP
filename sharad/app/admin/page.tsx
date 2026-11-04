import Link from "next/link";
import { notFound } from "next/navigation";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { isSiteAdmin } from "../../lib/lms";
import { AdminDashboard } from "../components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!isSiteAdmin(user)) notFound();
  return (
    <main className="app-shell">
      <header className="app-topbar"><div className="container nav-inner"><Link className="brand" href="/"><span className="brand-mark">SP</span><span>SHARAD PANDEY</span></Link><div className="app-top-actions"><Link className="text-link" href="/dashboard">Student view ↗</Link><a className="button button-light button-small" href={chatGPTSignOutPath("/")} target="_top">Sign out</a></div></div></header>
      <AdminDashboard displayName={user.displayName} />
    </main>
  );
}
