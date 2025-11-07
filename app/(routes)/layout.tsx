"use client"

import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar";
import Rightbar from "@/components/Rightbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideRightbar = pathname.startsWith("/messages")

  return (
    <div className="flex justify-center bg-black text-white max-w-[1200px] mx-auto">
      <Sidebar />
      <main className="flex-3">{children}</main>
      {!hideRightbar && <Rightbar />}
    </div>
  );
}
