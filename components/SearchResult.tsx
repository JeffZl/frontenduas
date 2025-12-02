import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import styles from "./SearchResult.module.css";

interface searchResult {
    user: {
        _id: string;
        name: string;
        handle: string;
        bio?: string;
        profilePicture?: {
            url: string;
        };
    };
    mode?: "conversation" | "profile";
    handleStartConversation?: (handle: string) => void;
    setShowConversationsList?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchResult = ({ user, mode = "profile", handleStartConversation, setShowConversationsList }: searchResult) => {
    const router = useRouter();

    const handleClick = () => {
        if (mode === "conversation" && handleStartConversation) {
            handleStartConversation(user.handle);
            if (window.innerWidth < 768) {
                setShowConversationsList?.(false);
            }
        } else if (mode === "profile") {
            router.push(`/profile/${user.handle}`);
        }
    };

    return (
        <button key={user._id} onClick={handleClick} className={styles.item}>
            {user.profilePicture?.url ? (
                <Image
                    src={user.profilePicture.url}
                    alt={user.name}
                    width={40}
                    height={40}
                    className={styles.avatar}
                />
            ) : (
                <div className={styles.avatarFallback}>
                    <span className={styles.avatarFallbackText}>
                        {user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                </div>
            )}

            <div className={styles.info}>
                <div className={styles.name}>{user.name}</div>
                <div className={styles.handle}>@{user.handle}</div>

                {user.bio && <div className={styles.bio}>{user.bio}</div>}
            </div>

            {mode === "conversation" && <FiPlus className={styles.plusIcon} />}
        </button>
    );
};

export default SearchResult;
