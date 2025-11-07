import Link from "next/link";

interface NavigationItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const NavItem = ({ icon, label, href }: NavigationItem) => {
    return (
        <Link href={href}>
            <div className="flex items-center gap-4 p-3 rounded-full cursor-pointer transition hover:bg-[#1a1a1a]">
                {icon}
                <span className="text-lg">{label}</span>
            </div>
        </Link>
    )
}
export default NavItem