"use client";

import { useEffect } from "react";

import { ApiUnavailableState } from "@/components/layout/api-unavailable-state";
import { isApiUnavailableError, isNetworkFetchError } from "@/lib/api/errors";

export default function AppError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isUnavailable =
    isApiUnavailableError(error) ||
    isNetworkFetchError(error) ||
    error.message.toLowerCase().includes("fetch failed");

  if (isUnavailable) {
    return <ApiUnavailableState />;
  }

  return (
    <ApiUnavailableState
      title="Algo deu errado"
      description={error.message || "Ocorreu um erro inesperado. Tente novamente."}
    />
  );
}
