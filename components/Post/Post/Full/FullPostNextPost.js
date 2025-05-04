"use client";

import Link from "next/link";
import { slugify } from "@/lib/utils/slugify";
import TextShortener from "@/components/ui/shared/TextShortener/TextShortener";
import ProductPostDiscountedPrice from "../Custom/ProductPostDiscountedPrice";
import { MoveLeft, MoveRight } from "lucide-react";
import { getFirstImage } from "../../../../lib/utils/getFirstImage";

export default function FullPostNextPost({ post, col, type }) {
  if (!post) return <div className="flex-1" />;

  const isNext = type === "next";
  const imageClassName = `w50 h50 min-[1700px]:w80 min-[1700px]:h80 object-cover rounded-lg ${
    isNext ? "ml-auto" : ""
  }`;

  const handleClick = () => {
    localStorage.setItem("fullPostId", post._id);
  };

  return (
    <Link
      href={`/${col.name}/${slugify(post.title)}`}
      onClick={handleClick}
      className={`👋 p15 wfc hover:bg-gray-100 br10 flex items-start gap-4 group active:scale-[.97] transition-all duration-1000 ${
        isNext ? "text-right" : ""
      }`}
    >
      <div className="flex-1">
        {col.name === "articles" ? (
          <div className="f aic">
            {!isNext && (
              <div className="group-hover:-translate-x-1 transition-transform">
                <MoveLeft className="p2 min-[1700px]:p0" />
              </div>
            )}
            {getFirstImage({
              text: post.text,
              title: post.title,
              className: imageClassName,
            })}
            {isNext && (
              <div className="group-hover:translate-x-1 transition-transform">
                <MoveRight className="p2 min-[1700px]:p0" />
              </div>
            )}
          </div>
        ) : post.files?.[0]?.fileUrl ? (
          <div className="f aic">
            {!isNext && (
              <div className="group-hover:-translate-x-1 transition-transform">
                <MoveLeft className="p2 min-[1700px]:p0" />
              </div>
            )}
            <img
              src={post.files[0].fileUrl}
              alt={post.title}
              className={imageClassName}
            />
            {isNext && (
              <div className="group-hover:translate-x-1 transition-transform">
                <MoveRight className="p2 min-[1700px]:p0" />
              </div>
            )}
          </div>
        ) : null}
        <div>
          <span className="text-sm text-gray-500 block">
            {/* Previous/Next {col.name.slice(0, -1)} */}
          </span>
          <h3
            className={`${
              isNext ? "mla" : ""
            } maw200 line-clamp-1 fz13 min-[1700px]:fz16 min-[1700px]:line-clamp-2 font-medium brand`}
          >
            {post.title}
          </h3>
          {post?.price && (
            <ProductPostDiscountedPrice
              className="hidden min-[1700px]:block !fz14 !black"
              post={post}
              show="one"
            />
          )}
          {(post.subtitle || post.text) && (
            <TextShortener
              length={70}
              text={post.subtitle || post.text}
              className={`hidden min-[1700px]:block ${
                isNext ? "mla" : "mra"
              } maw200 text-sm text-gray-500`}
            />
          )}
        </div>
      </div>
    </Link>
  );
}
