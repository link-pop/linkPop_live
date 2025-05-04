"use client";

import { Card } from "@/components/ui/card";
import CreatedBy from "./CreatedBy";
import CreatedAt from "./CreatedAt";
import CreatedAtTimeAgo from "./CreatedAtTimeAgo";
import PostAutoGenMongoFields from "./PostAutoGenMongoFields";
import Tags from "./Tags";
import { useRouter } from "next/navigation";
import Carousel from "@/components/ui/shared/Carousel/Carousel";
import StripeButton from "@/components/Stripe/StripeButton";
import PostIcons from "./Icons/PostIcons";
import { slugify } from "@/lib/utils/slugify";
import Image from "next/image";
import PostOtherIcons from "./Icons/PostOtherIcons";
import ExpiresAt from "./ExpiresAt";
import ScheduleAt from "./ScheduleAt";
import PaidContentOverlay from "./PaidContentOverlay";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function Post({
  mongoUser,
  className = "",
  style,
  top,
  top2,
  top3,
  top4,
  top5,
  top6,
  top7,
  top8,
  top9,
  col,
  isAdmin,
  showAdminIcons = true,
  showIcons = true,
  iconsClassName = "",
  postsPaginationType,
  post,
  showAutoGenMongoFields = true,
  showCreatedBy = false,
  showFiles = true,
  showCreatedAt = true,
  showCreatedAtTimeAgo = true,
  showExpiresAt = true,
  showScheduleAt = true,
  showTags = true,
  tagsClassName = "",
  useCard = true,
  showLike = true,
  showBuyBtn = false,
  // TODO !!!!! rename to showOtherIcons
  noOtherIcons = false,
  onClick,
  showComment = false,
}) {
  if (!post) return null;
  const { _id, createdBy, createdAt, tags, active, title } = post;
  const isOwner =
    mongoUser &&
    post?.createdBy?._id &&
    mongoUser._id.toString() === post?.createdBy?._id.toString();
  const router = useRouter();
  const { t } = useTranslation();

  function goToFullPost(e) {
    // If custom onClick handler is provided, call it and return
    if (onClick) {
      onClick(e);
      return;
    }

    // Use collection settings to determine if full post is disabled
    if (col?.settings?.noFullPost) return;
    // ! for analytics 1/3: set fullPostId in localStorage
    localStorage.setItem("fullPostId", _id);

    // Use slug-based routing only for products and articles
    if (col.name === "products" || col.name === "articles") {
      const titleSlug = slugify(title);
      // ???
      window.open(`/${col.name}/${titleSlug}`, "_blank");
    } else {
      // Use ID-based routing for other collections
      router.push(`/${col.name}/${_id}`);
    }
  }

  const activeClass = active === false ? "opacity-90" : "";
  const shadowClass =
    col.name === "products" || col.name === "articles"
      ? "shadow-lg hover:shadow-xl hover:shadow-blue-200"
      : "";

  const commonProps = {
    className: `Post !br0 wbba wf por p10 cp ${shadowClass} ${activeClass} ${className}`,
    onClick: goToFullPost,
    style: {
      // * background: post?.["bg color"] || "#ffffff",
      // * color: post?.["text color"] || "#000000",
      ...style,
    },
  };

  const content = (
    <div className="relative">
      {top}

      <div onClick={(e) => e.stopPropagation()}>
        {showCreatedBy && <CreatedBy createdBy={createdBy} />}
      </div>

      {top2}
      {showFiles && post.files && (
        <div className={`relative`}>
          {/* // * HACK to show Carousel for all files quantity */}
          {post.files.length === 999999 ? (
            <div className="relative aspect-square w-full">
              <Image
                src={post.files[0].fileUrl}
                alt="Post image"
                width={320}
                height={320}
                className="object-cover rounded-md w-full h-full"
              />
            </div>
          ) : (
            <Carousel
              showThumbnails={false}
              showIndicators={false}
              showArrows={post.files.length > 1}
              files={post.files}
              // may cause error
              // onClick={(e) => e.stopPropagation()}
            />
          )}
          {/* Paid content overlay */}
          {post.price > 0 && (
            <PaidContentOverlay post={post} mongoUser={mongoUser} col={col} />
          )}
        </div>
      )}

      {top3}
      {showAutoGenMongoFields && (
        <PostAutoGenMongoFields {...post} {...{ col }} />
      )}

      {top4}

      {showIcons && (
        <PostIcons
          {...{
            col,
            postsPaginationType,
            showLike,
            showComment,
            mongoUser,
            showAdminIcons,
            isAdmin,
            post,
            className: iconsClassName,
          }}
        />
      )}

      {/* // * OTHER ICONS */}
      {!noOtherIcons && (
        <PostOtherIcons
          {...{
            col,
            post,
            postsPaginationType,
            isAdmin,
            isOwner,
            showAdminIcons,
            mongoUser,
          }}
        />
      )}

      {top5}
      {showTags && (
        <Tags
          {...{
            tags,
            className: tagsClassName,
            col,
            onClick: (e) => e.stopPropagation(),
          }}
        />
      )}

      {top6}
      {showCreatedAt && (
        <CreatedAt className="fz14 gray" createdAt={createdAt} />
      )}

      {top7}
      <div className="f g10 aic">
        {showCreatedAtTimeAgo && (
          <CreatedAtTimeAgo className="if fz14 gray" createdAt={createdAt} />
        )}
        {showExpiresAt && (
          <ExpiresAt {...{ post, className: "if fz14 gray" }} />
        )}
        {showScheduleAt && (
          <ScheduleAt {...{ post, className: "if fz14 gray" }} />
        )}
      </div>

      {top8}
      {showBuyBtn && post?.price && active && (
        <div className="fcc" onClick={(e) => e.stopPropagation()}>
          <StripeButton {...{ postId: _id, col }} />
        </div>
      )}

      {top9}
    </div>
  );

  return useCard ? (
    <Card {...commonProps}>{content}</Card>
  ) : (
    <div {...commonProps}>{content}</div>
  );
}
