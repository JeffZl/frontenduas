import mongoose, { Schema, model, models } from "mongoose";

const messageSchema = new Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return !this.media || this.media.length === 0;
    }
  },
  media: [{
    url: String,
    publicId: String,
    mediaType: {
      type: String,
      enum: ['image', 'video', 'file']
    },
    size: Number,
    originalName: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = models.Message || model("Message", messageSchema);
export default Message;
