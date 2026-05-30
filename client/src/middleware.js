import { NextResponse } from "next/server";
import { DISABLED_ROUTES } from "./config/routes";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (DISABLED_ROUTES.includes(pathname)) {
    return NextResponse.rewrite(
      new URL("/404", request.url)
    );
  }

  return NextResponse.next();
}