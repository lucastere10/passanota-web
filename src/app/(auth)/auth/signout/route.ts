import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/server";

async function signOutAndRedirectToLogin(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = getRequestOrigin(request);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}

export async function GET(request: Request) {
  return signOutAndRedirectToLogin(request);
}

export async function POST(request: Request) {
  return signOutAndRedirectToLogin(request);
}
