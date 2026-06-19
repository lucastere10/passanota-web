import { AuthCallbackClient } from "@/app/(auth)/auth/callback/auth-callback-client";

type AuthCallbackPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return <AuthCallbackClient next={next} />;
}
