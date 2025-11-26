import Image from "next/image";
import Link from "next/link";
import styles from "./UserItem.module.css";

interface User {
    name: string;
    handle: string;
    avatar?: string | null;
}

const UserItem = ({ name, handle, avatar }: User) => {
    const getInitial = (name?: string) => {
        return name?.[0]?.toUpperCase() || "?";
    };

    return (
        <Link href={`/profile/${handle}`} className={styles.link}>
            <div className={styles.item} key={handle}>
                <div className={styles.left}>
                    {avatar ? (
                        <Image
                            src={avatar}
                            alt={name}
                            width={40}
                            height={40}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>
                            <span className={styles.avatarFallbackText}>
                                {getInitial(name)}
                            </span>
                        </div>
                    )}
                    <div className={styles.info}>
                        <span className={styles.name}>{name}</span>
                        <span className={styles.handle}>@{handle.replace("@", "")}</span>
                    </div>
                </div>

                <button className={styles.followBtn}>
                    Follow
                </button>
            </div>
        </Link>
    );
};

export default UserItem;
