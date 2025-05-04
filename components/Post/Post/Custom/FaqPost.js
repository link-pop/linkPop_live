import Accordion from "@/components/ui/shared/Accordion/Accordion";
import Post from "../Post";

export default function FaqPost(props) {
  const { post, isAdmin, col } = props;
  const { question, answer } = post;

  return (
    <Post
      {...{
        post,
        ...props,
        showAutoGenMongoFields: false,
        showCreatedAt: false,
        showCreatedAtTimeAgo: false,
        className: "maw760 wf",
        useCard: false,
      }}
      top4={<Accordion items={[{ trigger: question, content: answer }]} />}
    />
  );
}
