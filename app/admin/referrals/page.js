import AdminReferrals from "@/app/affiliate/AdminReferrals";
import AdminPageHeader from "@/components/ui/admin/AdminPageHeader";

export default function AdminReferralsPage() {
  return (
    <div className="p-6">
      <AdminPageHeader />
      <div className="oxh bg-background rounded-lg shadow p15">
        <AdminReferrals />
      </div>
    </div>
  );
}
