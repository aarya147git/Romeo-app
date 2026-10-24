import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMaskContact {
  isRequested: boolean;
  isMasked: boolean;
  revealedAt?: Date | null;
}

export interface IChatMessage {
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface IMatchInquiry extends Document {
  id: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderAvatar?: string;
  receiverName?: string;
  receiverAvatar?: string;
  listingId?: string;
  listingTitle?: string;
  status: 'pending' | 'accepted' | 'declined' | 'mutual_match';
  compatibilityScore?: number;
  message: string;
  contactPrivacy: IMaskContact;
  chatMessages: IChatMessage[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchInquirySchema = new Schema<IMatchInquiry>(
  {
    id: { type: String, index: true },
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    senderName: { type: String },
    senderAvatar: { type: String },
    receiverName: { type: String },
    receiverAvatar: { type: String },
    listingId: { type: String, index: true },
    listingTitle: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'mutual_match'],
      default: 'pending',
      index: true,
    },
    compatibilityScore: { type: Number, min: 0, max: 100 },
    message: { type: String, default: 'Hey! I saw your profile on Romeo and think we would be a great match.' },
    contactPrivacy: {
      isRequested: { type: Boolean, default: false },
      isMasked: { type: Boolean, default: true },
      revealedAt: { type: Date, default: null },
    },
    chatMessages: [
      {
        senderId: { type: String, required: true },
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        if (!ret.id && ret._id) ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

MatchInquirySchema.index({ senderId: 1, receiverId: 1 });

export const MatchInquiry: Model<IMatchInquiry> =
  mongoose.models.MatchInquiry || mongoose.model<IMatchInquiry>('MatchInquiry', MatchInquirySchema);
