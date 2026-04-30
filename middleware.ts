import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  /* Route guards can be added here if needed. 
     Currently, client-side AuthContext handles redirection for /dashboard.
     We could do server-side checks here if we used session cookies,
     but Firebase client SDK mostly relies on client state.
  */
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
