"use client";

import { useState, useRef, useEffect } from "react";
import ReviewsHub from "../../../../Review/ReviewsHub";
import useGetReviews from "@/components/Review/useGetReviews";
import PostsLTR from "@/components/Post/Posts/PostsLTR";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";

export default function ProductFullPostBottom({
  post,
  col,
  isAdmin,
  mongoUser,
}) {
  const [switched, setSwitched] = useState(0);
  const { reviews } = useGetReviews({ postId: post._id });
  const activeRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && sliderRef.current) {
      const { offsetLeft, offsetWidth } = activeRef.current;
      sliderRef.current.style.left = `${offsetLeft}px`;
      sliderRef.current.style.width = `${offsetWidth}px`;
    }
  }, [switched]);

  return (
    <>
      <div className="f fdc">
        <div className="f aic g15 relative">
          <span
            ref={switched === 0 ? activeRef : null}
            onClick={() => setSwitched(0)}
            className={`${
              switched === 0 ? "text-blue-500" : "text-gray-600"
            } cp py-2`}
          >
            Description
          </span>
          <span
            ref={switched === 1 ? activeRef : null}
            onClick={() => setSwitched(1)}
            className={`Reviews ${
              switched === 1 ? "text-blue-500" : "text-gray-600"
            } cp py-2`}
          >
            Reviews {`(${reviews?.length})`}
          </span>
          <div
            ref={sliderRef}
            className="absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-300"
          />
        </div>

        {switched === 0 && (
          <>
            <RichTextContent content={post.text} className="wf mt10" />

            <PostsLTR
              {...{
                searchParams: {
                  category: post.category?.[0]?.value, // eg: windows
                  excludeIds: [post._id], // don't show the current top fullPost
                },
                col,
                isAdmin,
                mongoUser,
                className: "por pt30 mt50",
                top: (
                  <div className="poa -t30 brand title wf tac">
                    You may also like:
                  </div>
                ),
              }}
            />
          </>
        )}
        {switched === 1 && <ReviewsHub {...{ post, col, isAdmin }} />}
      </div>
    </>
  );
}
