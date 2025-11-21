
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'list-of-sub-consultants');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="List Of Sub-consultants"
        description="Manage the list of sub-consultants."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
