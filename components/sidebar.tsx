"use client";

import Image from "next/image";
import NavItem from "./NavItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiHome, FiSearch, FiBell, FiMail, FiUser, FiSettings, FiPlus } from "react-icons/fi"
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser, FaCog } from "react-icons/fa"
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const route = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [navItems, setNavItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const { user: fetchedUser } = await res.json();
        setUser(fetchedUser);

        setNavItems([
          { label: "Home", href: "/", showOnMobile: true, icon: FaHome, ActiveIcon: FiHome },
          { label: "Explore", href: "/explore", showOnMobile: true , icon: FaSearch, ActiveIcon: FiSearch},
          { label: "Notifications", href: "/notifications", showOnMobile: true , icon: FaBell, ActiveIcon: FiBell},
          { label: "Messages", href: "/messages", showOnMobile: true , icon: FaEnvelope, ActiveIcon: FiMail},
          { label: "Profile", href: `/profile/${fetchedUser.handle}`, showOnMobile: true , icon: FaUser, ActiveIcon: FiUser},
          { label: "Settings", href: "/settings", showOnMobile: true , icon: FaCog, ActiveIcon: FiSettings},
        ]);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.logo}>
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          </div>

          <nav className={styles.nav}>
            {navItems.map(({ icon: Icon, label, href, ActiveIcon }) => (
              <NavItem
                key={label}
                icon={route === href || (href !== "/" && route.startsWith(href)) ? <Icon size={24} /> : <ActiveIcon size={24} />}
                label={label}
                href={href}
              />
            ))}
          </nav>

          <Link href="/create-quote">
            <button className={styles.postBtn}>
              Create Quote
            </button>
          </Link>
        </div>

        <div className={styles.userSection}>
          {loading ? (
            <div className={styles.loadingUser}>
              <div className={styles.avatarSkeleton} />
              <div className={styles.userInfoSkeleton}>
                <div className={styles.nameSkeleton} />
                <div className={styles.handleSkeleton} />
              </div>
            </div>
          ) : (
            <>
              {user?.profilePicture?.url ? (
                <Image
                  src={user.profilePicture.url}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className={styles.userAvatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <span className={styles.avatarInitial}>
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {user?.name}
                </span>
                <span className={styles.userHandle}>
                  @{user?.handle}
                </span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* navbarnya mobile */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileNavContainer}>
          {navItems.filter((item) => item.showOnMobile !== false).map(({ icon: Icon, label, href, ActiveIcon }) => (
              <Link
                key={label}
                href={href}
                >
                  {route === href || (href !== "/" && route.startsWith(href)) ? <Icon size={24} /> : <ActiveIcon size={24} />}
                </Link>
            ))}
        </div>
      </nav>

      {/* plus button pas di home page biar user di mobile bisa bikin quote */}
      {route === "/" && (
        <Link
          href="/create-quote"
          className={styles.mobilePlusButton}
          aria-label="Create Quote"
        >
          <FiPlus className={styles.plusIcon} />
        </Link>
      )}
    </>
  );
}