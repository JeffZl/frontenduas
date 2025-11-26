import Link from "next/link";
import styles from "./NavItem.module.css";

interface NavigationItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const NavItem = ({ icon, label, href }: NavigationItem) => {
    return (
        <Link href={href}>
            <div className={styles.navItem}>
                <span className={styles.icon}>{icon}</span>
                <span className={styles.label}>{label}</span>
            </div>
        </Link>
    );
};

export default NavItem;
