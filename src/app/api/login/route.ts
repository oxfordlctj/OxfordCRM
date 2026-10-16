import { NextResponse } from "next/server";
import { createSessionToken, passwordMatches, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const url = new URL(req.url);
  if (!passwordMatches(password)) {
    // небольшая задержка против перебора
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.redirect(new URL("/login?error=1", url), 303);
  }
  const res = NextResponse.redirect(new URL("/", url), 303);
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
