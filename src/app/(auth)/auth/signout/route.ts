import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const origin = getRequestOrigin(request);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
