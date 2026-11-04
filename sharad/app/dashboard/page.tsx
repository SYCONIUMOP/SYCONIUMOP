import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { isSiteAdmin } from "../../lib/lms";
import { DashboardClient } from "../components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  return <DashboardClient displayName={user.displayName} email={user.email} isAdmin={isSiteAdmin(user)} signOutHref={chatGPTSignOutPath("/")} />;
}
