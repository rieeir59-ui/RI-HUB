
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'list-of-approved-vendors');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="List of Approved Vendors"
        description="Manage the list of approved vendors."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
