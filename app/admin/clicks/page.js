import { getAll } from "@/lib/actions/crud";
import ClicksClient from "./ClicksClient";

export const dynamic = "force-dynamic";

export default async function ClicksPage() {
  // Fetch all data needed for the page here
  // Example: const data = await getAll({ ... });
  // For now, pass empty data as placeholder
  const data = {};
  return <ClicksClient data={data} />;
}
