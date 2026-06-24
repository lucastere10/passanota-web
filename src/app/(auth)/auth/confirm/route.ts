import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const completeProfileUrl = `${origin}/auth/complete-profile?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(completeProfileUrl);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(completeProfileUrl);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
