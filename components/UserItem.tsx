import Image from "next/image"
import Link from "next/link"

interface User {
    name: string,
    handle: string,
    avatar?: string | null
}

const UserItem = ({ name, handle, avatar }: User) => {
    const getInitial = (name?: string) => {
        return name?.[0]?.toUpperCase() || "?";
    };

    return (
        <Link href={`/profile/${handle}`}>
            <div className="flex items-center justify-between" key={handle}>
                    <div className="flex items-center gap-2.5">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt={name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 shrink-0">
                                <span className="text-black dark:text-white font-bold text-sm">
                                    {getInitial(name)}
                                </span>
                            </div>
                        )}
                        <div className="grow">
                            <span className="block font-bold text-black dark:text-white">{name}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-500">@{handle.replace('@', '')}</span>
                        </div>
                    </div>
                    <button className="bg-black dark:bg-white text-white dark:text-black font-bold text-sm py-1.5 px-3 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                        Follow
                    </button>
            </div>
        </Link>
    )
}
export default UserItem