export function getSupabaseUrl(): string {
  // SUPABASE_URL is read at runtime on Cloud Run (middleware/server).
  // NEXT_PUBLIC_* is inlined at build time for the browser bundle.
  const value = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(
      "Missing environment variable: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
    );
  }
  return value;
}

export function getSupabasePublishableKey(): string {
  const value =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      "Missing environment variable: SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return value;
}

/** @deprecated Use getSupabasePublishableKey */
export function getSupabaseAnonKey(): string {
  return getSupabasePublishableKey();
}
