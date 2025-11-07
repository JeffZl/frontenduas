import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 160,
    default: ''
  },
  profilePicture: {
    url: String,
    publicId: String,
    format: String 
  },
  coverPicture: { 
    url: String, 
    publicId: String, 
    format: String 
  },
  location: String,
  website: String,
  birthdate: Date,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  tweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }],
  tweetsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ createdAt: -1 });

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = models.User || model("User", userSchema);
export default User;
