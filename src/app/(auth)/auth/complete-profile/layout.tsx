import { Suspense } from "react";

import CompleteProfilePage from "./page";

export default function CompleteProfileLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <CompleteProfilePage />
    </Suspense>
  );
}
