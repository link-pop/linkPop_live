import {
  Heart,
  Mail,
  MessageSquare,
  UserRoundPlus,
  AtSign,
  HeartOff,
  UserRoundMinus,
  Trophy,
  Gavel,
  Clock,
  DollarSign,
} from "lucide-react";

// Function to get the appropriate icon based on notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case "message":
      return <Mail className="!w16 !h16" />;
    case "like":
      return <Heart className="!w16 !h16" />;
    case "unlike":
      return <HeartOff className="!w16 !h16" />;
    case "comment":
      return <MessageSquare className="!w16 !h16" />;
    case "follow":
      return <UserRoundPlus className="!w16 !h16" />;
    case "unfollow":
      return <UserRoundMinus className="!w16 !h16" />;
    case "mention":
      return <AtSign className="!w16 !h16" />;
    case "auction_won":
      return <Trophy className="!w16 !h16 text-emerald-600" />;
    case "auction_sold":
      return <DollarSign className="!w16 !h16 text-green-600" />;
    case "auction_ended":
      return <Clock className="!w16 !h16 text-muted-foreground" />;
    case "auction_outbid":
      return <Gavel className="!w16 !h16 text-amber-600" />;
    default:
      return null;
  }
};

export default getNotificationIcon;
