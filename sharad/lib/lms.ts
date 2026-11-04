import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";

export function database() {
  if (!env.DB) throw new Error("The LMS database is not connected yet.");
  return env.DB;
}

export async function signedInUser() {
  return getChatGPTUser();
}

export function isSiteAdmin(user: ChatGPTUser | null) {
  const adminEmail = env.SITE_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(user && adminEmail && user.email.toLowerCase() === adminEmail);
}

export async function saveUser(user: ChatGPTUser) {
  const db = database();
  const role = isSiteAdmin(user) ? "admin" : "student";
  await db
    .prepare(
      `INSERT INTO users (user_id, email, display_name, role)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email = excluded.email,
         display_name = excluded.display_name,
         role = CASE WHEN excluded.role = 'admin' THEN 'admin' ELSE users.role END,
         last_login_at = CURRENT_TIMESTAMP`,
    )
    .bind(user.userId, user.email, user.displayName, role)
    .run();
}

export async function requireUser() {
  const user = await signedInUser();
  if (!user) return null;
  await saveUser(user);
  return user;
}

export const starterCourses = [
  {
    id: "digital-marketing-foundations",
    slug: "digital-marketing-foundations",
    title: "Digital Marketing Foundations",
    description:
      "Build a practical foundation in audience research, SEO, paid ads, landing pages, and measurement.",
    category: "Digital Marketing",
    level: "Beginner",
    lessons: [
      {
        id: "dm-01",
        title: "Start with the customer and the offer",
        duration: 9,
        content:
          "Marketing starts with a clear customer, a real problem, and an offer that helps solve it. Before choosing a channel, write down who you want to reach, what they need, and what action you want them to take.\n\nPractice: describe one customer in a sentence, name their main problem, and write one clear offer for them.",
      },
      {
        id: "dm-02",
        title: "SEO and useful website content",
        duration: 11,
        content:
          "Search visibility grows from pages that answer a specific question clearly. Choose one topic, use the words your audience would search for, and make the next step easy to find.\n\nPractice: outline one useful page with a clear title, three helpful sections, and one call to action.",
      },
      {
        id: "dm-03",
        title: "Google Ads and Meta Ads basics",
        duration: 12,
        content:
          "Paid campaigns need a goal, a defined audience, a relevant creative, and a way to measure what happened. Keep the first test focused so you can learn which message and audience respond.\n\nPractice: write one campaign goal, one audience, two message angles, and the event you would track.",
      },
      {
        id: "dm-04",
        title: "Landing pages and lead capture",
        duration: 10,
        content:
          "A landing page should carry one idea from headline to action. Explain the value, answer the most important questions, and ask only for information needed to follow up.\n\nPractice: sketch a headline, three benefits, one proof point you can substantiate, and one simple form.",
      },
      {
        id: "dm-05",
        title: "Measure, improve, and use AI carefully",
        duration: 10,
        content:
          "Use a small set of measures tied to your goal: qualified visits, enquiries, booked calls, or sales. AI can help draft and organize work; review facts, brand voice, and customer impact before publishing.\n\nPractice: choose three weekly metrics and write one decision you would make if each metric improved or declined.",
      },
    ],
  },
  {
    id: "website-building-essentials",
    slug: "website-building-essentials",
    title: "Website Building Essentials",
    description:
      "Plan and build a responsive website with a clear message, useful pages, and a confident launch.",
    category: "Website Building",
    level: "Beginner",
    lessons: [
      {
        id: "web-01",
        title: "Plan the pages and the user journey",
        duration: 8,
        content:
          "Start with the purpose of the site and the questions a visitor needs answered. Give each page one job and connect those pages into a simple journey.\n\nPractice: map a home page, services or courses page, about page, and contact step for one small business.",
      },
      {
        id: "web-02",
        title: "Build responsive layouts",
        duration: 10,
        content:
          "A responsive layout adapts content to the screen instead of shrinking a desktop design. Keep reading width comfortable, make buttons easy to tap, and check the narrowest screens first.\n\nPractice: design one card layout that changes from three columns to one column on a phone.",
      },
      {
        id: "web-03",
        title: "Write and design for clarity",
        duration: 9,
        content:
          "Use a clear headline, readable type, consistent spacing, and images that support the message. Every section should help a visitor understand, compare, or act.\n\nPractice: rewrite a vague headline so it names the audience and the outcome of the page.",
      },
      {
        id: "web-04",
        title: "Prepare a confident launch",
        duration: 8,
        content:
          "Before launch, check mobile layouts, links, page titles, forms, image sizes, and domain settings. Ask someone unfamiliar with the project to complete the main task.\n\nPractice: create a launch checklist and ask a reviewer to test the site on their phone.",
      },
    ],
  },
  {
    id: "freelance-to-business",
    slug: "freelance-to-business",
    title: "Freelance to Business",
    description:
      "Turn an existing skill into a clear service, useful proof, and a repeatable client process.",
    category: "Freelance Business",
    level: "Build and Grow",
    lessons: [
      {
        id: "biz-01",
        title: "Position your skill around a problem",
        duration: 9,
        content:
          "Clients look for help with a problem, not a list of tools. Connect your skill to a specific type of customer and the work they want done.\n\nPractice: write “I help [audience] with [problem] by [service].” Make it specific enough that the right client recognizes themselves.",
      },
      {
        id: "biz-02",
        title: "Build proof with focused projects",
        duration: 8,
        content:
          "A portfolio is stronger when each example explains the goal, your contribution, and what changed. Label practice projects honestly and request permission before sharing client work.\n\nPractice: create one case-study outline with context, process, deliverable, and evidence.",
      },
      {
        id: "biz-03",
        title: "Create a lead and follow-up system",
        duration: 11,
        content:
          "Choose a few channels you can use consistently. Track prospects, next steps, and follow-ups in one simple place, and personalize outreach around the business you contacted.\n\nPractice: define your lead stages and write a short, relevant first message.",
      },
      {
        id: "biz-04",
        title: "Run a clear client conversation",
        duration: 10,
        content:
          "A useful sales conversation begins by understanding the goal, constraints, decision process, and fit. Explain your process, scope, and price clearly, then agree on the next step.\n\nPractice: prepare five discovery questions and a short outline for presenting your service.",
      },
    ],
  },
] as const;
