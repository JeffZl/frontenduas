import Link from "next/link";

interface NavigationItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const NavItem = ({ icon, label, href }: NavigationItem) => {
    return (
        <Link href={href}>
            <div className="flex items-center gap-4 p-3 rounded-full cursor-pointer transition hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
                <span className="text-black dark:text-white">{icon}</span>
                <span className="text-lg text-black dark:text-white">{label}</span>
            </div>
        </Link>
    )
}
export default NavItem