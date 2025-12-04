"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Rightbar from "@/components/Rightbar";
import styles from "./layout.module.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideRightbar = pathname.startsWith("/messages");

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
      {!hideRightbar && <Rightbar />}
    </div>
  );
}
