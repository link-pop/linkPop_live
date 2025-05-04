import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AddCollectionAdminButton({ col }) {
  const { isAdmin } = await getMongoUser();
  return (
    isAdmin && (
      <Link href={`add/${col.name}`}>
        <Plus />
      </Link>
    )
  );
}
