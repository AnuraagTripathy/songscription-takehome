import { NextResponse, type NextRequest } from "next/server";
import { DEMO_PASSWORD, GATE_COOKIE } from "@/lib/gate";

/**
 * The lock on the door. Every request that is not already carrying the password
 * is sent to the gate — pages and the API both, so the library cannot be read
 * around the front door.
 */
export function middleware(req: NextRequest) {
  if (req.cookies.get(GATE_COOKIE)?.value === DEMO_PASSWORD) return NextResponse.next();
  if (req.nextUrl.pathname === "/gate") return NextResponse.next();

  const gate = req.nextUrl.clone();
  gate.pathname = "/gate";
  gate.search = "";
  return NextResponse.redirect(gate);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
