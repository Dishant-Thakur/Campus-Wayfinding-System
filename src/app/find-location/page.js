import { Suspense } from "react";
import FindLocation from "@/components/pages/FindLocation";

export default function Page() {
  return (
    <Suspense>
      <FindLocation />
    </Suspense>
  );
}
