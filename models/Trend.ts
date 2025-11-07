import mongoose, { Schema, model, models } from "mongoose";

const trendSchema = new mongoose.Schema({
  hashtag: {
    type: String,
    required: true,
    unique: true
  },
  tweetCount: {
    type: Number,
    default: 0
  },
  region: {
    type: String,
    default: 'global'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

trendSchema.index({ tweetCount: -1, lastUpdated: -1 });

const Trend = models.Trend || model("Trend", trendSchema);
export default Trend;
