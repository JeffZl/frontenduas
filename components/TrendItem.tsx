import Link from "next/link";
import styles from "./TrendItem.module.css";

interface Trend {
    topic: string;
    title: string;
    postCount: string;
}

const TrendItem = ({ topic, title, postCount }: Trend) => {
    const titleSliced = title.startsWith("#") ? title.slice(1) : title;

    return (
        <div className={styles.trendItem}>
            <Link href={`/explore/${titleSliced}`} className={styles.link}>
                <span className={styles.topic}>
                    {topic} · Trending
                </span>

                <p className={styles.title}>{title}</p>

                <span className={styles.postCount}>{postCount}</span>
            </Link>
        </div>
    );
};

export default TrendItem;
