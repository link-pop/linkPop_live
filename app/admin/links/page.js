import { getAll } from "@/lib/actions/crud";
import AdminLinksClient from "./AdminLinksClient";

export const dynamic = "force-dynamic";

export default async function AdminLinks() {
  // Fetch all data needed for the page here
  // Example: const data = await getAll({ ... });
  // For now, pass empty data as placeholder
  const data = {};
  return <AdminLinksClient data={data} />;
}
