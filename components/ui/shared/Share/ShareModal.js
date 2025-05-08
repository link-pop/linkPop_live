"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Link as LinkIcon,
  X,
  Smartphone,
  MessageCircle,
  BookOpen,
  Send,
  Phone,
  FileText,
  Share2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import useShareHelper from "./ShareHelper";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { platformData } from "@/lib/data/platformData";

// Import platform icons from platformData
const {
  facebook: { icon: FacebookIcon },
  twitter: { icon: TwitterIcon },
  linkedin: { icon: LinkedinIcon },
  whatsapp: { icon: WhatsappIcon },
  telegram: { icon: TelegramIcon },
  reddit: { icon: RedditIcon },
  pinterest: { icon: PinterestIcon },
  tumblr: { icon: TumblrIcon },
  tiktok: { icon: TiktokIcon },
  line: { icon: LineIcon },
  messenger: { icon: MessengerIcon },
  slack: { icon: SlackIcon },
  evernote: { icon: EvernoteIcon },
  instapaper: { icon: InstapaperIcon },
  medium: { icon: MediumIcon },
  mastodon: { icon: MastodonIcon },
  vimeo: { icon: VimeoIcon },
  teams: { icon: TeamsIcon },
  yammer: { icon: YammerIcon },
  trello: { icon: TrelloIcon },
  buffer: { icon: BufferIcon },
  digg: { icon: DiggIcon },
  weibo: { icon: WeiboIcon },
  xing: { icon: XingIcon },
} = platformData;

// Define all social media platforms for sharing
const SOCIAL_PLATFORMS = [
  {
    name: "Facebook",
    icon: FacebookIcon,
    color: "#1877F2",
    shareUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    category: "popular",
  },
  {
    name: "Twitter",
    icon: TwitterIcon,
    color: "#1DA1F2",
    shareUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title || "")}`,
    category: "popular",
  },
  {
    name: "LinkedIn",
    icon: LinkedinIcon,
    color: "#0A66C2",
    shareUrl: (url, title) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "popular",
  },
  {
    name: "Email",
    icon: Mail,
    color: "#EA4335",
    shareUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(
        title || "Check this out!"
      )}&body=${encodeURIComponent(url)}`,
    category: "popular",
  },
  {
    name: "WhatsApp",
    icon: WhatsappIcon,
    color: "#25D366",
    shareUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(
        title ? `${title} ${url}` : url
      )}`,
    category: "popular",
  },
  {
    name: "Telegram",
    icon: TelegramIcon,
    color: "#0088cc",
    shareUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title || "")}`,
    category: "popular",
  },
  {
    name: "Messenger",
    icon: MessengerIcon,
    color: "#0084FF",
    shareUrl: (url) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
        url
      )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`,
    category: "popular",
  },
  {
    name: "Reddit",
    icon: RedditIcon,
    color: "#FF4500",
    shareUrl: (url, title) =>
      `https://reddit.com/submit?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "social",
  },
  {
    name: "Pinterest",
    icon: PinterestIcon,
    color: "#E60023",
    shareUrl: (url, title, image) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        url
      )}&media=${encodeURIComponent(
        image || ""
      )}&description=${encodeURIComponent(title || "")}`,
    category: "social",
  },
  {
    name: "Tumblr",
    icon: TumblrIcon,
    color: "#36465D",
    shareUrl: (url, title) =>
      `https://www.tumblr.com/share/link?url=${encodeURIComponent(
        url
      )}&name=${encodeURIComponent(title || "")}`,
    category: "social",
  },
  {
    name: "TikTok",
    icon: TiktokIcon,
    color: "#FF69B4",
    shareUrl: (url, title) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(url)}`,
    category: "social",
  },
  {
    name: "Mastodon",
    icon: MastodonIcon,
    color: "#6364FF",
    shareUrl: (url, title) =>
      `https://mastodon.social/share?text=${encodeURIComponent(
        title || ""
      )} ${encodeURIComponent(url)}`,
    category: "social",
  },
  {
    name: "Sina Weibo",
    icon: WeiboIcon,
    color: "#DF2029",
    shareUrl: (url, title) =>
      `http://service.weibo.com/share/share.php?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "social",
  },
  {
    name: "Xing",
    icon: XingIcon,
    color: "#006567",
    shareUrl: (url, title) =>
      `https://www.xing.com/spi/shares/new?url=${encodeURIComponent(url)}`,
    category: "social",
  },
  {
    name: "Digg",
    icon: DiggIcon,
    color: "#FF69B4",
    shareUrl: (url, title) =>
      `https://digg.com/submit?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "social",
  },
  {
    name: "LINE",
    icon: LineIcon,
    color: "#00b900",
    shareUrl: (url) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        url
      )}`,
    category: "messaging",
  },
  {
    name: "Viber",
    icon: MessageCircle,
    color: "#665CAC",
    shareUrl: (url) => `viber://forward?text=${encodeURIComponent(url)}`,
    category: "messaging",
  },
  {
    name: "SMS",
    icon: Smartphone,
    color: "#33CC66",
    shareUrl: (url, title) =>
      `sms:?body=${encodeURIComponent(title ? `${title} ${url}` : url)}`,
    category: "messaging",
  },
  {
    name: "Slack",
    icon: SlackIcon,
    color: "#4A154B",
    shareUrl: (url, title) =>
      `https://slack.com/openid/connect/share?url=${encodeURIComponent(url)}`,
    category: "messaging",
  },
  {
    name: "Microsoft Teams",
    icon: TeamsIcon,
    color: "#6264A7",
    shareUrl: (url, title) =>
      `https://teams.microsoft.com/share?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "messaging",
  },
  {
    name: "Yammer",
    icon: YammerIcon,
    color: "#0072C6",
    shareUrl: (url, title) =>
      `https://www.yammer.com/messages/new?login=true&status=${encodeURIComponent(
        title || ""
      )} ${encodeURIComponent(url)}`,
    category: "messaging",
  },
  {
    name: "Pocket",
    icon: BookOpen,
    color: "#EF3F56",
    shareUrl: (url, title) =>
      `https://getpocket.com/save?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "other",
  },
  {
    name: "Flipboard",
    icon: FileText,
    color: "#E12828",
    shareUrl: (url, title) =>
      `https://share.flipboard.com/bookmarklet/popout?v=2&title=${encodeURIComponent(
        title || ""
      )}&url=${encodeURIComponent(url)}`,
    category: "other",
  },
  {
    name: "Medium",
    icon: MediumIcon,
    color: "#FF69B4",
    shareUrl: (url, title) =>
      `https://medium.com/m/web/sharepreview?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title || "")}`,
    category: "other",
  },
  {
    name: "Evernote",
    icon: EvernoteIcon,
    color: "#00A82D",
    shareUrl: (url, title) =>
      `https://www.evernote.com/clip.action?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "other",
  },
  {
    name: "Instapaper",
    icon: InstapaperIcon,
    color: "#FF69B4",
    shareUrl: (url, title) =>
      `https://www.instapaper.com/edit?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title || "")}`,
    category: "other",
  },
  {
    name: "Vimeo",
    icon: VimeoIcon,
    color: "#1AB7EA",
    shareUrl: (url, title) =>
      `https://vimeo.com/share?url=${encodeURIComponent(url)}`,
    category: "other",
  },
  {
    name: "Trello",
    icon: TrelloIcon,
    color: "#0079BF",
    shareUrl: (url, title) =>
      `https://trello.com/add-card?url=${encodeURIComponent(
        url
      )}&name=${encodeURIComponent(title || "")}`,
    category: "other",
  },
  {
    name: "Buffer",
    icon: BufferIcon,
    color: "#2C4BFF",
    shareUrl: (url, title) =>
      `https://buffer.com/add?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title || "")}`,
    category: "other",
  },
];

export default function ShareModal({
  isOpen,
  onClose,
  url = "",
  title = "",
  text = "",
  image = null,
  customPlatforms = null,
}) {
  const { toastSet } = useContext();
  const { t } = useTranslation();
  const { shareContent } = useShareHelper();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);

  // Check if native share is available
  useEffect(() => {
    setNativeShareAvailable(
      typeof navigator !== "undefined" && !!navigator.share
    );
  }, []);

  // Use custom platforms if provided, otherwise use default platforms
  const platforms = customPlatforms || SOCIAL_PLATFORMS;

  // Format URL if it's not already a full URL
  const fullUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
    ? window.location.href
    : "";

  // Group platforms by category
  const popularPlatforms = platforms.filter((p) => p.category === "popular");
  const socialPlatforms = platforms.filter((p) => p.category === "social");
  const messagingPlatforms = platforms.filter(
    (p) => p.category === "messaging"
  );
  const otherPlatforms = platforms.filter((p) => p.category === "other");

  // Get the maximum number of platforms to ensure consistent height
  const maxPlatforms = Math.max(
    popularPlatforms.length,
    socialPlatforms.length,
    messagingPlatforms.length,
    otherPlatforms.length
  );

  // Calculate the number of rows needed (4 platforms per row)
  const rowsNeeded = Math.ceil(maxPlatforms / 4);

  // Minimum height for the grid to accommodate the max number of platforms
  const gridMinHeight = rowsNeeded * 56; // Each row is approximately 56px (icon + text + padding)

  // Handle direct platform sharing
  const handlePlatformShare = (platform) => {
    // For platforms with normal share URLs
    const shareUrl = platform.shareUrl(fullUrl, title, image);
    window.open(shareUrl, "_blank", "width=600,height=400");
    if (onClose) onClose();
  };

  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);

      toastSet({
        isOpen: true,
        title: t("linkCopied") || "Link copied to clipboard",
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // Handle native share
  const handleNativeShare = async () => {
    try {
      const shareData = {
        title: title || document.title,
        text: text || "",
        url: fullUrl,
      };

      await navigator.share(shareData);

      if (onClose) onClose();
    } catch (error) {
      console.error("Error sharing:", error);
      if (error.name !== "AbortError") {
        // Only show error if it's not a user cancellation
        toastSet({
          isOpen: true,
          title: t("shareError") || "Error sharing content",
        });
      }
    }
  };

  // Render platform buttons
  const renderPlatformButtons = (platformsList) => {
    return (
      <div
        className={`grid grid-cols-4 gap-2 p-3`}
        style={{ minHeight: `${gridMinHeight}px` }}
      >
        {platformsList.map((platform) => (
          <button
            key={platform.name}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent/20 transition-colors"
            onClick={() => handlePlatformShare(platform)}
            aria-label={`Share on ${platform.name}`}
          >
            {typeof platform.icon === "function" ? (
              <platform.icon size={16} color={platform.color} />
            ) : (
              <platform.icon size={16} color={platform.color} />
            )}
            <span className="text-xs font-semibold truncate max-w-full">
              {platform.name}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md p-0 border-0 shadow-lg bg-background/95 backdrop-blur-sm">
        <div className="relative">
          <button
            className="absolute right-4 top-4 p-1 rounded-full bg-accent/20 hover:bg-accent/40 transition-colors"
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <AlertDialogHeader className="p-6 pb-2">
            <AlertDialogTitle className="text-xl font-bold text-center">
              {t("shareWith") || "Share with"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {text ||
                t("shareThisLink") ||
                "Share this link with your friends"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Optional preview image */}
          {image && (
            <div className="px-6 py-2">
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-background">
                <Image
                  src={image}
                  alt={title || "Share preview"}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          {/* Platform tabs */}
          <Tabs
            defaultValue="popular"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="popular" className="text-xs">
                  {t("mainTab") || "Popular"}
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">
                  {t("networkTab") || "Social"}
                </TabsTrigger>
                <TabsTrigger value="messaging" className="text-xs">
                  {t("chatTab") || "Messaging"}
                </TabsTrigger>
                <TabsTrigger value="other" className="text-xs">
                  {t("moreTab") || "Other"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="mt-0">
              {renderPlatformButtons(popularPlatforms)}
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              {renderPlatformButtons(socialPlatforms)}
            </TabsContent>

            <TabsContent value="messaging" className="mt-0">
              {renderPlatformButtons(messagingPlatforms)}
            </TabsContent>

            <TabsContent value="other" className="mt-0">
              {renderPlatformButtons(otherPlatforms)}
            </TabsContent>
          </Tabs>

          {/* Copy link button */}
          <div className="p-6 pt-2 !pb0">
            <div className="flex w-full items-center space-x-2">
              <div className="bg-accent/20 py-2 px-3 rounded-lg text-xs text-muted-foreground flex-1 truncate">
                {fullUrl}
              </div>
              <Button
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={handleCopyLink}
                className={`transition-all ${
                  copied ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {copied ? t("copied") || "Copied!" : t("copy") || "Copy"}
              </Button>
            </div>
          </div>

          {/* Native Share Button */}
          {nativeShareAvailable && (
            <div className="fz12 px-6 py-2">
              <div
                className="tac w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:underline cursor-pointer"
                onClick={handleNativeShare}
              >
                {" "}
                <span>
                  {t("useDefaultShareTool") || "Use default share tool"}
                </span>
              </div>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
