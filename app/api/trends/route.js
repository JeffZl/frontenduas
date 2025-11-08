import { connectToDB } from "@/lib/mongodb";
import Trend from "@/models/Trend";
import Tweet from "@/models/Tweet";

export async function GET() {
  try {
    await connectToDB();
    const trends = await Trend.find({})
      .sort({ tweetCount: -1, lastUpdated: -1 })
      .limit(10)
      .lean();

    const formattedTrends = trends.map((trend) => {
      const hashtag = trend.hashtag.startsWith("#") 
        ? trend.hashtag.substring(1) 
        : trend.hashtag;
      
      return {
        topic: "Trending",
        title: `#${hashtag}`,
        postCount: `${formatCount(trend.tweetCount)} posts`,
        hashtag: hashtag,
        tweetCount: trend.tweetCount,
      };
    });

    return Response.json({ trends: formattedTrends }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trends:", error);
    return Response.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}

function formatCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

