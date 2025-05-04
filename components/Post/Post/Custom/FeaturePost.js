import Post from "../Post";
import Image from "next/image";

export default function FeaturePost(props) {
  const { post, isAdmin, col } = props;
  const { title, desc, files } = post;

  return (
    <Post
      {...{
        post,
        ...props,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
        showFiles: false,
        useCard: false,
      }}
      top4={
        <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          {/* Icon/Image */}
          <div className="flex justify-center mb-6">
            {files?.[0]?.fileUrl ? (
              <div className="relative w230 h230 overflow-hidden rounded-lg">
                <Image
                  src={files[0].fileUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-4 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-900 dark:text-blue-300">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h5 className="mb-3 text-xl font-bold tracking-tight text-gray-900 text-center break-words dark:text-white">
            {title}
          </h5>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center break-words leading-relaxed dark:text-gray-400">
            {desc}
          </p>
        </div>
      }
    />
  );
}
