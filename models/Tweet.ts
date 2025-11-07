import mongoose, { Schema, model, models } from "mongoose";

const tweetSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: 280,
    required: function() {
      return !this.media || this.media.length === 0;
    }
  },
  media: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    mediaType: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    thumbnail: String,
    duration: Number,
    width: Number,
    height: Number,
    size: Number,
    format: String,
    altText: {
      type: String,
      maxlength: 420,
      default: ''
    }
  }],
  hashtags: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweetsCount: {
    type: Number,
    default: 0
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }],
  repliesCount: {
    type: Number,
    default: 0
  },
  originalTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  parentTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  mediaOnly: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

tweetSchema.index({ author: 1, createdAt: -1 });
tweetSchema.index({ createdAt: -1 });
tweetSchema.index({ parentTweet: 1 });
tweetSchema.index({ originalTweet: 1 });
tweetSchema.index({ isDeleted: 1 });

tweetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Tweet = models.Tweet || model("Tweet", tweetSchema);
export default Tweet;
