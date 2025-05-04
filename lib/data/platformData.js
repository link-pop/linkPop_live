import {
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  MessageCircle,
  Pencil,
  Hash,
  Music,
  Video,
  Share2,
  Code,
  BookOpen,
  Headphones,
  DollarSign,
  Radio,
  AtSign,
  Layers,
  Bookmark,
  Tv,
  MessageSquare,
  Send,
  Phone,
  Heart,
  PenTool,
  Camera,
  Music2,
} from "lucide-react";
import OnlyfansIcon from "@/components/ui/icons/OnlyfansIcon";
import TiktokIcon from "@/components/ui/icons/TiktokIcon";
import SnapchatIcon from "@/components/ui/icons/SnapchatIcon";
import PinterestIcon from "@/components/ui/icons/PinterestIcon";
import RedditIcon from "@/components/ui/icons/RedditIcon";
import TwitchIcon from "@/components/ui/icons/TwitchIcon";
import DiscordIcon from "@/components/ui/icons/DiscordIcon";
import WhatsappIcon from "@/components/ui/icons/WhatsappIcon";
import TelegramIcon from "@/components/ui/icons/TelegramIcon";
import SignalIcon from "@/components/ui/icons/SignalIcon";
import GithubIcon from "@/components/ui/icons/GithubIcon";
import GitlabIcon from "@/components/ui/icons/GitlabIcon";
import MediumIcon from "@/components/ui/icons/MediumIcon";
import TumblrIcon from "@/components/ui/icons/TumblrIcon";
import VimeoIcon from "@/components/ui/icons/VimeoIcon";
import DribbbleIcon from "@/components/ui/icons/DribbbleIcon";
import BehanceIcon from "@/components/ui/icons/BehanceIcon";
import SpotifyIcon from "@/components/ui/icons/SpotifyIcon";
import SoundcloudIcon from "@/components/ui/icons/SoundcloudIcon";
import PatreonIcon from "@/components/ui/icons/PatreonIcon";
import ClubhouseIcon from "@/components/ui/icons/ClubhouseIcon";
import MastodonIcon from "@/components/ui/icons/MastodonIcon";
import ThreadsIcon from "@/components/ui/icons/ThreadsIcon";

export const platformData = {
  onlyfans: {
    icon: OnlyfansIcon,
    url: "https://onlyfans.com/",
    label: "OnlyFans",
  },
  instagram: {
    icon: Instagram,
    url: "https://www.instagram.com/",
    label: "Instagram",
  },
  twitter: {
    icon: Twitter,
    url: "https://twitter.com/",
    label: "Twitter",
  },
  facebook: {
    icon: Facebook,
    url: "https://www.facebook.com/",
    label: "Facebook",
  },
  tiktok: {
    icon: TiktokIcon,
    url: "https://www.tiktok.com/@",
    label: "TikTok",
  },
  youtube: {
    icon: Youtube,
    url: "https://www.youtube.com/",
    label: "YouTube",
  },
  linkedin: {
    icon: Linkedin,
    url: "https://www.linkedin.com/in/",
    label: "LinkedIn",
  },
  snapchat: {
    icon: SnapchatIcon,
    url: "https://www.snapchat.com/add/",
    label: "Snapchat",
  },
  pinterest: {
    icon: PinterestIcon,
    url: "https://www.pinterest.com/",
    label: "Pinterest",
  },
  reddit: {
    icon: RedditIcon,
    url: "https://www.reddit.com/user/",
    label: "Reddit",
  },
  twitch: {
    icon: TwitchIcon,
    url: "https://www.twitch.tv/",
    label: "Twitch",
  },
  discord: {
    icon: DiscordIcon,
    url: "https://discord.gg/",
    label: "Discord",
  },
  whatsapp: {
    icon: WhatsappIcon,
    url: "https://wa.me/",
    label: "WhatsApp",
  },
  telegram: {
    icon: TelegramIcon,
    url: "https://t.me/",
    label: "Telegram",
  },
  signal: {
    icon: SignalIcon,
    url: "https://signal.me/#p/",
    label: "Signal",
  },
  github: {
    icon: GithubIcon,
    url: "https://github.com/",
    label: "GitHub",
  },
  gitlab: {
    icon: GitlabIcon,
    url: "https://gitlab.com/",
    label: "GitLab",
  },
  medium: {
    icon: MediumIcon,
    url: "https://medium.com/@",
    label: "Medium",
  },
  tumblr: {
    icon: TumblrIcon,
    url: "https://tumblr.com/",
    label: "Tumblr",
  },
  vimeo: {
    icon: VimeoIcon,
    url: "https://vimeo.com/",
    label: "Vimeo",
  },
  dribbble: {
    icon: DribbbleIcon,
    url: "https://dribbble.com/",
    label: "Dribbble",
  },
  behance: {
    icon: BehanceIcon,
    url: "https://behance.net/",
    label: "Behance",
  },
  spotify: {
    icon: SpotifyIcon,
    url: "https://open.spotify.com/user/",
    label: "Spotify",
  },
  soundcloud: {
    icon: SoundcloudIcon,
    url: "https://soundcloud.com/",
    label: "SoundCloud",
  },
  patreon: {
    icon: PatreonIcon,
    url: "https://patreon.com/",
    label: "Patreon",
  },
  clubhouse: {
    icon: ClubhouseIcon,
    url: "https://www.clubhouse.com/@",
    label: "Clubhouse",
  },
  mastodon: {
    icon: MastodonIcon,
    url: "https://mastodon.social/@",
    label: "Mastodon",
  },
  threads: {
    icon: ThreadsIcon,
    url: "https://www.threads.net/@",
    label: "Threads",
  },
  other: {
    icon: ExternalLink,
    url: "#",
    label: "Other",
  },
};

export const platformIcons = Object.fromEntries(
  Object.entries(platformData).map(([key, value]) => [key, value.icon])
);

export const platformUrls = Object.fromEntries(
  Object.entries(platformData).map(([key, value]) => [key, value.url])
);

export const allPlatforms = Object.entries(platformData).map(
  ([value, data]) => ({
    value,
    label: data.label,
    icon: data.icon,
  })
);

// Helper function to get platform URL with username
export function getPlatformUrl(platform, username) {
  // Clean username (remove @ if present)
  const cleanUsername = username?.startsWith("@")
    ? username.substring(1)
    : username;

  const baseUrl = platformUrls[platform] || "";
  if (!baseUrl || !cleanUsername) return "";

  return baseUrl + cleanUsername;
}
