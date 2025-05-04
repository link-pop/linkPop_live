import Carousel from "@/components/ui/shared/Carousel/Carousel";
import PostAutoGenMongoFields from "../PostAutoGenMongoFields";
import Tags from "../Tags";
import CreatedAt from "../CreatedAt";
import CreatedAtTimeAgo from "../CreatedAtTimeAgo";
import PostIcons from "../Icons/PostIcons";
import CreatedBy from "../CreatedBy";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";

export default function FullPost({
  skipCustom = false, // to use both FullPost and CustomFullPost IN ONE COMPONENT set this to true
  className = "",
  top,
  top2,
  top3,
  top4,
  top5,
  top6,
  top7,
  top8,
  top9,
  post,
  col,
  isAdmin,
  mongoUser,
  visitedMongoUser,
  showAutoGenMongoFields = true,
  showCreatedBy = false,
  showFiles = true,
  showCreatedAt = true,
  showCreatedAtTimeAgo = true,
  showTags = true,
  showText = true,
  showIcons = true,
  defaultShowComments = false,
  iconsClassName = "",
  adminIconsClassName = "",
}) {
  // * Only try to load custom component if skipCustom is false
  if (skipCustom === false) {
    try {
      const CustomFullPost = require(`./Custom/${
        col.name.charAt(0).toUpperCase() + col.name.slice(1, -1)
      }FullPost`).default;

      return (
        <CustomFullPost
          {...{
            post,
            col,
            isAdmin,
            mongoUser,
            visitedMongoUser,
            showAutoGenMongoFields: false,
          }}
        />
      );
    } catch (error) {
      console.error(error);
    }
  }

  if (!post) {
    return <div className="my15 tac">No post data available</div>;
  }

  const { files, tags, createdAt, text, _id } = post;

  // * Use Default FullPost comp if custom comp not found
  return (
    <div className={`👋 por mt30 max-w-[1200px] wf mxa ${className}`}>
      {top}
      {/* // * Tags */}
      {showTags && tags?.length > 0 && (
        <Tags {...{ tags, col, className: "ttu my15" }} />
      )}

      {top2}
      {showCreatedBy && (
        <CreatedBy {...{ createdBy: post?.createdBy, className: "px15 mb5" }} />
      )}

      {top3}

      {/* // * Files */}

      {top4}

      {showFiles && files?.length > 0 && (
        <Carousel
          className="max-w-[1000px] wf"
          {...{ showThumbnails: false, showIndicators: false, files }}
        />
      )}

      {top5}

      {/* // * Post Icons */}
      {showIcons && (
        <PostIcons
          {...{
            col,
            isAdmin,
            mongoUser,
            post,
            // className: "poa -t30 r0",
            className: "db mra",
            className: iconsClassName,
            adminIconsClassName,
            defaultShowComments,
          }}
        />
      )}

      {top6}
      {/* // * AutoGenMongoFields */}
      {showAutoGenMongoFields && <PostAutoGenMongoFields {...post} />}

      {top7}
      {/* // * CreatedAt */}
      {showCreatedAt && <CreatedAt createdAt={createdAt} className="px15" />}
      {showCreatedAtTimeAgo && (
        <CreatedAtTimeAgo createdAt={createdAt} className="px15" />
      )}

      {top8}
      {/* // * Text */}
      {showText && text && (
        <>
          <RichTextContent content={text} className="px15 pb15 mt-4" />
        </>
      )}

      {top9}
    </div>
  );
}
