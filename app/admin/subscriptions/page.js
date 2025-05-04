import AdminSubscriptions2 from "@/app/pricing/AdminSubscriptions2";
import AdminPageHeader from "@/components/ui/admin/AdminPageHeader";

export default function AdminSubscriptionsPage() {
  return (
    <div className="p-6">
      <AdminPageHeader />
      <div className="oxh bg-background rounded-lg shadow p15">
        <AdminSubscriptions2 />
      </div>
    </div>
  );
}
