"use client";

import ProductPostDiscountedPrice from "../../Custom/ProductPostDiscountedPrice";
import FullPost from "../FullPost";
import AddToCartButton from "@/components/Cart/AddToCartButton";
import ProductFullPostBottom from "./ProductFullPostBottom";
import ReviewsTotalScore from "@/components/Review/ReviewsTotalScore";

export default function ProductFullPost({ post, col, isAdmin, mongoUser }) {
  return (
    <>
      <FullPost
        {...{
          post,
          col,
          isAdmin,
          mongoUser,
        }}
        showAutoGenMongoFields={false}
        skipCustom={true} // ! Set to true to prevent infinite recursion
        showFiles={false}
        showText={false}
        showCreatedAt={isAdmin ? true : false}
        showCreatedAtTimeAgo={isAdmin ? true : false}
        showTags={true}
        className="min-h-[100vh]"
        top9={
          <div className="max-w-[1200px] mxa p15">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <img src={post?.files[0].fileUrl} className="wf ha" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl fw600 mb-2">{post?.title}</h1>
                <ReviewsTotalScore postId={post._id} />
                <ProductPostDiscountedPrice
                  className="f g7 t_125 my10"
                  post={post}
                />
                <p className="gray mb15">{post?.subtitle}</p>
                <div className="mb15 text-green-600">
                  Available on backorder
                </div>
                <AddToCartButton
                  post={post}
                  className={`!wfc !br10 px15 py5 !mx0 mb15`}
                  showQuantity={false}
                />
                <div className="text-sm mb15">
                  <span className="fw500">SKU:</span> {post?.SKU}
                </div>
              </div>
            </div>
            <ProductFullPostBottom {...{ post, col, isAdmin, mongoUser }} />
          </div>
        }
      />
    </>
  );
}
