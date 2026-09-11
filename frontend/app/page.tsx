"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// "/" has no content of its own - no login gate, so it just opens straight
// into the dashboard.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
