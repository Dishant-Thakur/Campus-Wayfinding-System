import { Suspense } from "react";
import ScanQR from "@/components/pages/ScanQR";

export default function Page() {
  return (
    <Suspense>
      <ScanQR />
    </Suspense>
  );
}
