import Image from "next/image"
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi"

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

const SearchResult = ({ user, mode="profile", handleStartConversation, setShowConversationsList }: searchResult) => {
    const router = useRouter()

    const handleClick = () => {
        if (mode === "conversation" && handleStartConversation) {
            handleStartConversation(user.handle)
        if (window.innerWidth < 768) {
            setShowConversationsList?.(false)
        }
        } else if (mode === "profile") {
            router.push(`/profile/${user.handle}`)
        }
    }
    return (
        <button
            key={user._id}
            onClick={handleClick}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-[#0f0f0f] rounded-lg transition"
        >
            {user.profilePicture?.url ? (
                <Image
                    src={user.profilePicture.url}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover shrink-0"
                />
            ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shrink-0">
                <span className="text-black dark:text-white font-bold text-sm">
                    {user.name?.[0]?.toUpperCase() || "?"}
                </span>
                </div>
            )}
            <div className="flex-1 min-w-0 text-left">
                <div className="font-bold truncate text-black dark:text-white">{user.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.handle}</div>
                {user.bio && (
                <div className="text-xs text-gray-600 dark:text-gray-500 truncate mt-1">{user.bio}</div>
                )}
            </div>
            {mode === "conversation" && <FiPlus className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
            </button>
    )
}

export default SearchResult