import mongoose from "mongoose";
import { cartSchema } from "./CartModel";
import { productsSchema, ordersSchema } from "./ProductModel";
import { reviewSchema } from "./ReviewModel";
import { likesSchema } from "./LikeModel";
import { commentsSchema } from "./CommentModel";
import { attachmentSchema } from "@/chatServer/models/AttachmentModel";
const { chatRoomSchema } = require("@/chatServer/models/ChatRoomModel");
const { chatMessageSchema } = require("@/chatServer/models/ChatMessageModel");
const { notificationSchema } = require("@/chatServer/models/NotificationModel");
import { usersSchema } from "./UserModel";
import { feedsSchema } from "./FeedModel";
import { hiddenFeedsSchema } from "./HiddenFeedModel";
import { hiddenMessagesSchema } from "./HiddenMessageModel";
import { hiddenUsersSchema } from "./HiddenUserModel";
import { contactSchema } from "./ContactModel";
import { subscriptionsSchema } from "./SubscriptionModel";
import { purchaseSchema } from "./PurchaseModel";
import { directlinkSchema } from "./DirectlinkModel";
import { profileVisitorSchema } from "./ProfileVisitor";
import { Subscriptions2Schema } from "./Subscriptions2Model";
import { socialLinkSchema } from "./SocialLinkModel";
import { landingPageSchema } from "./LandingPageModel";
import { geoFilterSchema } from "./GeoFilterModel";
import { referralSchema } from "./ReferralModel";
import { referralEarningSchema } from "./ReferralEarningModel";

// RESERVED names: ["url", "email", "password", "tel", "color"]
// can also include RESERVED names: ["support url", "support email", "support password", "support tel", "support color"]
// other RESERVED names:
// "text" gives TipTap text editor
// "files" gives file uploader (stored directly in col);
// ALSO FILES can be stored separately from col (Attachment model)
// "tags" gives tag input and tags search
// "createdBy" populates user info and creates user logo + name component
// "order" used for ordering elements; to sort by "order" (1,2,3...)
// "active" used to hide/show post to non-admin users; gives boolean input (Switch component)
// "price" gives stripe payment button if price is > 0

// ! schema name must be plural
const schemas = {
  users: usersSchema,
  feeds: feedsSchema,
  hiddenFeeds: hiddenFeedsSchema,
  hiddenMessages: hiddenMessagesSchema,
  hiddenUsers: hiddenUsersSchema,
  // products: productsSchema,
  // orders: ordersSchema,
  contacts: contactSchema,
  // carts: cartSchema,
  // reviews: reviewSchema,
  likes: likesSchema,
  comments: commentsSchema,
  attachments: attachmentSchema,
  subscriptions: subscriptionsSchema,
  chatrooms: chatRoomSchema,
  chatmessages: chatMessageSchema,
  notifications: notificationSchema,
  purchases: purchaseSchema,
  directlinks: directlinkSchema,
  s1profilevisitors: profileVisitorSchema,
  s2profilevisitors: profileVisitorSchema,
  subscriptions2: Subscriptions2Schema,
  s1sociallinks: socialLinkSchema,
  s2sociallinks: socialLinkSchema,
  landingpages: landingPageSchema,
  geofilters: geoFilterSchema,
  referrals: referralSchema,
  referralearnings: referralEarningSchema,
};

export const models = {};

// Initialize models
for (const [name, schema] of Object.entries(schemas)) {
  try {
    models[name] = mongoose.models[name] || mongoose.model(name, schema);
  } catch (error) {
    if (mongoose.models?.[name]) {
      models[name] = mongoose.models[name];
    } else {
      models[name] = mongoose.model(name, schema);
    }
  }
}

export default models;
