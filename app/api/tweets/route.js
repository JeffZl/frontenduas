import { connectToDB } from "@/lib/mongodb"
import Tweet from "@/models/Tweet"
import User from "@/models/User"
import Trend from "@/models/Trend"
import cloudinary from "@/lib/cloudinary"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

async function uploadToCloudinary(file, type) {
  const uploadResponse = await cloudinary.uploader.upload(file, {
    resource_type: type === "video" ? "video" : "image",
    folder: "tweets_media",
  });

  return {
    url: uploadResponse.secure_url,
    publicId: uploadResponse.public_id,
    mediaType: type,
    width: uploadResponse.width,
    height: uploadResponse.height,
    size: uploadResponse.bytes,
    format: uploadResponse.format,
    duration: uploadResponse.duration || null,
  };
}

export async function GET(req) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 })

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = parseInt(searchParams.get("skip") || "0")

    const tweets = await Tweet.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("author", "handle name profilePicture")
      .populate({
        path: "originalTweet",
        populate: {
          path: "author",
          select: "handle name profilePicture"
        }
      })
      .lean()

    const userId = decoded.id.toString()
    const tweetsWithStatus = tweets.map(tweet => {
      const likesArray = Array.isArray(tweet.likes) ? tweet.likes : []
      const retweetsArray = Array.isArray(tweet.retweets) ? tweet.retweets : []
      const isLiked = likesArray.some((likeId) => likeId?.toString() === userId) || false
      const isRetweeted = retweetsArray.some((retweetId) => retweetId?.toString() === userId) || false
      
      return {
        ...tweet,
        isLiked,
        isRetweeted,
      }
    })

    return Response.json({ tweets: tweetsWithStatus }, { status: 200 })
  } catch (err) {
    console.error("Error fetching tweets:", err)
    return Response.json({ error: "Failed to fetch tweets" }, { status: 500 })
  }
}


export async function POST(req) {
  try {
    await connectToDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 })

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return Response.json({ error: "Invalid or expired token" }, { status: 403 })
    }

    const body = await req.json()
    const { content, media, hashtags, parentTweet } = body

    if (!content && (!media || media.length === 0)) return Response.json({ error: "Tweet must contain content or media" }, { status: 400 })

    const uploadedMedia = []
    if (media && media.length > 0) {
      for (const item of media) {
        const { base64, type } = item
        const uploadResult = await uploadToCloudinary(base64, type)
        uploadedMedia.push(uploadResult)
      }
    }

    const user = await User.findById(decoded.id)
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    const newTweet = await Tweet.create({
      author: user._id,
      content,
      media: uploadedMedia,
      hashtags,
      mediaOnly: !content && uploadedMedia.length > 0,
      parentTweet: parentTweet || null,
    })

    user.tweets.push(newTweet._id)
    user.tweetsCount += 1
    await user.save()


    if (parentTweet) {
      const parent = await Tweet.findById(parentTweet)
      if (parent) {
        parent.replies.push(newTweet._id)
        parent.repliesCount += 1
        await parent.save()
      }
    }

    if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
      for (const hashtag of hashtags) {
        const cleanHashtag = hashtag.replace(/^#/, '').toLowerCase();
        if (cleanHashtag) {
          await Trend.findOneAndUpdate(
            { hashtag: cleanHashtag },
            {
              $inc: { tweetCount: 1 },
              $set: { lastUpdated: new Date() },
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    const populatedTweet = await newTweet.populate("author", "handle name profilePicture")

    return Response.json({ message: "Tweet created successfully", tweet: populatedTweet }, { status: 201 })
  } catch (err) {
    console.error("Error creating tweet:", err);
    return Response.json({ error: "Failed to create tweet" }, { status: 500 });
  }
}
