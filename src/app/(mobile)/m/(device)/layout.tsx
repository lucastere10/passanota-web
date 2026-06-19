import { MobileLayoutClient } from "@/components/mobile/mobile-layout-client";

export default function MobileDeviceLayout({ children }: { children: React.ReactNode }) {
  return <MobileLayoutClient>{children}</MobileLayoutClient>;
}
