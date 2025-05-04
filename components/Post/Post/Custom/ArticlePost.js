import TextShortener from "@/components/ui/shared/TextShortener/TextShortener";
import Post from "../Post";
import Tags from "../Tags";
import { getFirstImage } from "../../../../lib/utils/getFirstImage";

export default function ArticlePost(props) {
  const { title, text, createdAt, tags } = props.post;

  // ! first image from text
  const firstImage = getFirstImage({
    text,
    title,
    className: "w-full h-[200px] object-cover",
  });

  // ! articleCreatedAt
  const articleCreatedAt = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Post
      {...props}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      useCard={false}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className="fui"
      top4={
        <>
          <div className="f aic g10">
            <Tags
              onClick={(e) => e.stopPropagation()}
              tags={tags}
              col={{ name: "articles" }}
            />
            <span className="text-[lightgrey] mr5"> {"|"}</span>
            <div className="fz14">{articleCreatedAt}</div>
          </div>
          {firstImage}
        </>
      }
      top5={
        <div className="fc g15">
          <div className="black fw500 fz20 mb5 line-clamp-2">{title}</div>
          <TextShortener className={`fz13 gray mb5`} text={text} />
          <div className="t_075 tdu hover:brand hover:no-underline wfc">
            READ MORE
          </div>
        </div>
      }
    />
  );
}
