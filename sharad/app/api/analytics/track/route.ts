import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!env.DB) return Response.json({ ok: false }, { status: 503 });

  let payload: { visitorId?: string; path?: string; referrer?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const visitorId = payload.visitorId?.trim() ?? "";
  if (!/^[a-zA-Z0-9-]{20,80}$/.test(visitorId)) {
    return Response.json({ error: "Invalid visitor ID." }, { status: 400 });
  }

  const rawPath = payload.path?.trim() ?? "/";
  let path = "/";
  try {
    const url = new URL(rawPath, "https://site.local");
    path = url.pathname.slice(0, 200) || "/";
  } catch {
    return Response.json({ error: "Invalid page path." }, { status: 400 });
  }

  let referrerHost: string | null = null;
  if (payload.referrer) {
    try {
      referrerHost = new URL(payload.referrer).hostname.slice(0, 120) || null;
    } catch {
      referrerHost = null;
    }
  }

  const user = await getChatGPTUser();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO page_views (visitor_id, path, referrer_host, user_id, day_key)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(visitorId, path, referrerHost, user?.userId ?? null, new Date().toISOString().slice(0, 10))
    .run();

  return new Response(null, { status: 204 });
}
