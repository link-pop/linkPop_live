import ViewIcon from "@/components/ui/icons/ViewIcon";

export default function PostViews({ post }) {
  return (
    post?.views > 0 && (
      <div className="abounce f aic g2 gray fz12">
        <ViewIcon className="w20" />
        {post?.views}
      </div>
    )
  );
}
