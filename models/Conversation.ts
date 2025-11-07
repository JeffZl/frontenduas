import mongoose, { Schema, model, models } from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

conversationSchema.pre('validate', function(next) {
  if (this.participants && this.participants.length !== 2) {
    next(new Error('Conversation must have exactly 2 participants'));
  } else {
    next();
  }
});

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = models.Conversation || model("Conversation", conversationSchema);
export default Conversation;
