import Post from "../Post";
import Link from "next/link";

const buttonStyles = `
  .group:hover svg path {
    fill: var(--hover-fill) !important;
    fill-opacity: 0.2 !important;
  }
`;

export default function PricingPost(props) {
  const { post, isAdmin, col } = props;
  const {
    title,
    price,
    features,
    "text color": textColor,
    applyButtonText,
  } = post;

  // Split features into two columns if more than 5 features
  const firstColumnFeatures = features?.slice(0, 5);
  const secondColumnFeatures = features?.slice(5);
  const hasSecondColumn = secondColumnFeatures?.length > 0;

  // Format price with commas
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Post
      {...{
        post,
        ...props,
        showAutoGenMongoFields: false,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
        showBuyBtn: false,
        className: "maw620 wf min-h-[400px] border border-black rounded-none",
      }}
      top4={
        <>
          <style>{buttonStyles}</style>
          <div className="maw620 wf min-h-[400px] fc justify-between">
            <div>
              {/* Top Section with Bird and Titles */}
              <div className="fc sm:flex-row items-center justify-between">
                <div className="mb30 sm:mb0 tac flex-grow">
                  <h2 className="text-xl md:text-2xl font-serif tracking-[0.25em]">
                    {title}
                  </h2>
                  <p className="font-serif tracking-[0.15em] text-base md:text-lg">
                    {formatPrice(price)}
                  </p>
                </div>
                {/* // ! HACK */}
                <div className="hidden sm:block w-[90px]"></div>
              </div>

              {/* Feature List */}
              <div
                className={`px15 ${
                  hasSecondColumn ? "grid grid-cols-1 md:grid-cols-2" : ""
                }`}
              >
                {/* First Column */}
                <ul className="fc g10">
                  {firstColumnFeatures?.map((feature, index) => (
                    <li
                      key={index}
                      className="font-serif tracking-wider text-sm leading-relaxed"
                    >
                      • {feature?.label}
                    </li>
                  ))}
                </ul>

                {/* Second Column (if needed) */}
                {hasSecondColumn && (
                  <ul className="fc g10 mt10 sm:mt0">
                    {secondColumnFeatures?.map((feature, index) => (
                      <li
                        key={index + 5}
                        className="font-serif tracking-wider text-sm leading-relaxed"
                      >
                        • {feature?.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}
