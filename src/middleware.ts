import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  const lastLogin = req.cookies.get("lastLogin")?.value;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  // if user is logged in recently, go to dashboard
  if (token && lastLogin && Date.now() - Number(lastLogin) < oneWeek) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // if user opens root "/", show landing
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/landing/index.html", req.url));
  }

  return NextResponse.next();
}
