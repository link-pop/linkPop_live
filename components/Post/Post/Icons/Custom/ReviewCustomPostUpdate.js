import { useContext } from "@/components/Context/Context";
import AddReviewForm from "@/components/Review/AddReviewForm";
import UpdateIcon from "@/components/ui/icons/UpdateIcon";
import Link from "next/link";

export default function ReviewCustomPostUpdate({ post, col }) {
  const { dialogSet } = useContext();

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    dialogSet({
      isOpen: true,
      title: "Updating review",
      comp: <AddReviewForm updatingPost={post} col={col} isUpdating={true} />,
      showBtns: false,
    });
  }

  return (
    <Link href={`#`} onClick={onClick}>
      <UpdateIcon />
    </Link>
  );
}
