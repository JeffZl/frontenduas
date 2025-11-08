"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FaPlus } from "react-icons/fa";
import { PiSignOut } from "react-icons/pi";

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
  const isLightMode = currentTheme === "light";

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
    <div
      className={`min-h-screen border-x border-gray-300 dark:border-[#2f3336] ${
        isLightMode ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      <header
        className={`sticky top-0 z-10 border-b border-gray-300 dark:border-[#2f3336] px-6 py-4 backdrop-blur ${
          isLightMode ? "bg-white/90" : "bg-black/80"
        }`}
      >
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      <div className="space-y-6 px-6 py-8">
        <section
          className={`rounded-2xl p-6 shadow-lg ${
            isLightMode ? "bg-zinc-100 shadow-zinc-300/60" : "bg-[#0f0f0f] shadow-black/30"
          }`}
        >
          <h2 className="text-lg font-semibold text-sky-500">Appearance</h2>
          <div
            className={`mt-4 flex items-center justify-between rounded-xl p-4 ${
              isLightMode ? "bg-white" : "bg-[#16181c]"
            }`}
          >
            <div>
              <p className="font-medium">Theme</p>
              <p className={`text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Toggle between light and dark modes.
              </p>
            </div>

            <label className="relative inline-flex h-7 w-12 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={currentTheme === "dark"}
                onChange={(event) => {
                  const newTheme = event.target.checked ? "dark" : "light";
                  setTheme(newTheme);
                  console.log("Theme changed to:", newTheme);
                }}
                className="peer sr-only"
              />
              <span
                className={`absolute inset-0 rounded-full transition ${
                  isLightMode ? "bg-zinc-300" : "bg-zinc-600"
                } peer-checked:bg-sky-500`}
              />
              <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
        </section>

        <section
          className={`rounded-2xl p-6 shadow-lg ${
            isLightMode ? "bg-zinc-100 shadow-zinc-300/60" : "bg-[#0f0f0f] shadow-black/30"
          }`}
        >
          <h2 className="text-lg font-semibold text-sky-500">Notifications</h2>
          <div
            className={`mt-4 flex items-center justify-between rounded-xl p-4 ${
              isLightMode ? "bg-white" : "bg-[#16181c]"
            }`}
          >
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className={`text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Receive alerts for new activity and messages.
              </p>
            </div>

            <label className="relative inline-flex h-7 w-12 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(event) => setNotificationsEnabled(event.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`absolute inset-0 rounded-full transition ${
                  isLightMode ? "bg-zinc-300" : "bg-zinc-600"
                } peer-checked:bg-sky-500`}
              />
              <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
        </section>

        <section
          className={`rounded-2xl p-6 shadow-lg ${
            isLightMode ? "bg-zinc-100 shadow-zinc-300/60" : "bg-[#0f0f0f] shadow-black/30"
          }`}
        >
          <h2 className="text-lg font-semibold text-sky-500">Account</h2>
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => router.push("/landing-page")}
              className={`flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 font-semibold transition ${
                isLightMode
                  ? "border-sky-500 text-sky-500 hover:bg-sky-500/10"
                  : "border-sky-500 text-sky-500 hover:bg-sky-500/10"
              }`}
            >
              <span className="text-lg"><FaPlus /></span>
              <span>Add Account</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
            >
              <span className="text-lg"><PiSignOut /></span>
              <span>Log Out</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

