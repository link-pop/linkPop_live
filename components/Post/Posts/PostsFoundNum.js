import { skipUrlSearchParams } from "@/lib/utils/mongo/_settingsSkipUrlSearchParams";

export default function PostsFoundNum({ postsFoundNum, searchParams, col }) {
  const hasActiveSearchParams = Object.entries(searchParams || {}).some(
    ([key, value]) => value && !skipUrlSearchParams(col).includes(key)
  );

  if (!hasActiveSearchParams) return null;

  return (
    <div
      key={postsFoundNum}
      className="abounce tracking-[1px] fcc wf mt10 fz14 gray"
    >
      found: {postsFoundNum}
    </div>
  );
}
