"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FaPlus } from "react-icons/fa";
import { PiSignOut } from "react-icons/pi";
import styles from "./page.module.css";

type ThemePreference = "dark" | "light";

export default function SettingsPage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [theme]);
  
  if (!mounted) return null;

  const currentTheme =  theme || "dark";

  // useEffect(() => {
  //   localStorage.setItem("notifications", notificationsEnabled ? "on" : "off");
  // }, [notificationsEnabled]);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      localStorage.clear();
      router.push("/landing-page");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Settings</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <p className={styles.settingLabel}>Theme</p>
              <p className={styles.settingDescription}>
                Toggle between light and dark modes.
              </p>
            </div>

            <label className={styles.toggleWrapper}>
              <input
                type="checkbox"
                checked={currentTheme === "dark"}
                onChange={(event) => {
                  const newTheme = event.target.checked ? "dark" : "light";
                  setTheme(newTheme);
                  console.log("Theme changed to:", newTheme);
                }}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack} />
              <span className={styles.toggleThumb} />
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <p className={styles.settingLabel}>Enable Notifications</p>
              <p className={styles.settingDescription}>
                Receive alerts for new activity and messages.
              </p>
            </div>

            <label className={styles.toggleWrapper}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(event) => setNotificationsEnabled(event.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack} />
              <span className={styles.toggleThumb} />
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.accountActions}>
            <button
              type="button"
              onClick={() => router.push("/landing-page")}
              className={styles.addAccountButton}
            >
              <span className={styles.addAccountButtonIcon}><FaPlus /></span>
              <span>Add Account</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              <span className={styles.logoutButtonIcon}><PiSignOut /></span>
              <span>Log Out</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

