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

// "use client";

// import Image from "next/image";
// import NavItem from "./NavItem";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { FiHome, FiSearch, FiBell, FiMail, FiUser, FiSettings, FiPlus } from "react-icons/fi"
// import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser, FaCog } from "react-icons/fa"

// export default function Sidebar() {
//   const route = usePathname();
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [navItems, setNavItems] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await fetch("/api/user/me", {
//           cache: "no-store",
//           credentials: "include",
//         });

//         if (!res.ok) throw new Error("Failed to fetch user");

//         const { user: fetchedUser } = await res.json();
//         setUser(fetchedUser);

//         setNavItems([
//           { label: "Home", href: "/", showOnMobile: true, icon: FaHome, ActiveIcon: FiHome },
//           { label: "Explore", href: "/explore", showOnMobile: true , icon: FaSearch, ActiveIcon: FiSearch},
//           { label: "Notifications", href: "/notifications", showOnMobile: true , icon: FaBell, ActiveIcon: FiBell},
//           { label: "Messages", href: "/messages", showOnMobile: true , icon: FaEnvelope, ActiveIcon: FiMail},
//           { label: "Profile", href: `/profile/${fetchedUser.handle}`, showOnMobile: true , icon: FaUser, ActiveIcon: FiUser},
//           { label: "Settings", href: "/settings", showOnMobile: true , icon: FaCog, ActiveIcon: FiSettings},
//         ]);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   return (
//     <>
//       <aside className="hidden md:flex flex-col justify-between min-h-screen border-r border-gray-300 dark:border-[#2f3336] p-4 w-[250px] flex-1.5 bg-white dark:bg-black">
//         <div>
//           <div className="logo p-2 mb-4">
//             <Image src="/logo.svg" alt="Logo" width={32} height={32} />
//           </div>

//           <nav className="space-y-2">
//             {navItems.map(({ icon: Icon, label, href, ActiveIcon }) => (
//               <NavItem
//                 key={label}
//                 icon={route === href || (href !== "/" && route.startsWith(href)) ? <Icon size={24} /> : <ActiveIcon size={24} />}
//                 label={label}
//                 href={href}
//               />
//             ))}
//           </nav>

//           <Link href="/create-quote">
//             <button className="post-btn w-full bg-black dark:bg-white text-white dark:text-black font-bold rounded-full py-3 mt-4 hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer transition">
//               Create Quote
//             </button>
//           </Link>
//         </div>

//         <div className="user-section flex items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] cursor-pointer transition">
//           {loading ? (
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
//               <div className="flex flex-col gap-1">
//                 <div className="w-20 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
//                 <div className="w-14 h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
//               </div>
//             </div>
//           ) : (
//             <>
//               {user?.profilePicture?.url ? (
//                 <Image
//                   src={user.profilePicture.url}
//                   alt="User Avatar"
//                   width={40}
//                   height={40}
//                   className="rounded-full mr-2 object-cover"
//                 />
//               ) : (
//                 <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 mr-2">
//                   <span className="text-black dark:text-white font-bold text-lg">
//                     {user?.name?.[0]?.toUpperCase() || "?"}
//                   </span>
//                 </div>
//               )}
//               <div className="leading-tight">
//                 <span className="block font-bold truncate w-[120px] text-black dark:text-white">
//                   {user?.name}
//                 </span>
//                 <span className="block text-gray-600 dark:text-gray-500 text-sm truncate w-[120px]">
//                   @{user?.handle}
//                 </span>
//               </div>
//             </>
//           )}
//         </div>
//       </aside>

//       {/* navbarnya mobile */}
//       <nav
//         className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-300 dark:border-[#2f3336] bg-white/95 dark:bg-black/95 backdrop-blur z-30"
//         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
//       >
//         <div className="flex items-center justify-around py-2">
//           {navItems.filter((item) => item.showOnMobile !== false).map(({ icon: Icon, label, href, ActiveIcon }) => (
//               <Link
//                 key={label}
//                 href={href}
//                 >
//                   {route === href || (href !== "/" && route.startsWith(href)) ? <Icon size={24} /> : <ActiveIcon size={24} />}
//                 </Link>
//             ))}
//         </div>
//       </nav>

//       {/* plus button pas di home page biar user di mobile bisa bikin quote */}
//       {route === "/" && (
//         <Link
//           href="/create-quote"
//           className="md:hidden fixed bottom-16 right-4 bg-black dark:bg-white text-white dark:text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-30"
//           aria-label="Create Quote"
//         >
//           <FiPlus className="w-6 h-6" />
//         </Link>
//       )}
//     </>
//   );
// }
