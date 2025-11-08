import Link from "next/link";

interface Trend {
    topic: string;
    title: string;
    postCount: string;
}

const TrendItem = ({ topic, title, postCount }: Trend) => {
    const titleSliced = title.startsWith("#") ? title.slice(1) : title;
    return (
        <div
            className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] cursor-pointer transition"
        >
            <Link href={`/explore/${titleSliced}`}>
                <span className="block text-gray-400 text-sm">
                    {topic} · Trending
                </span>
                <p className="font-bold text-lg">{title}</p>
                <span className="block text-gray-500 text-sm">{postCount}</span>
            </Link>
        </div>
    )
}

export default TrendItem