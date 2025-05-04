import Button from "@/components/ui/shared/Button/Button2";
import { deleteWelcomeMessage } from "@/lib/actions/deleteWelcomeMessage";

export default function DeleteWelcomeMessageButton() {
  return (
    <form action={deleteWelcomeMessage}>
      <Button type="submit" variant="danger" className={`mt15`}>
        Delete
      </Button>
    </form>
  );
}
