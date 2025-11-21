
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'preliminary-project-budget');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Preliminary Project Budget"
        description="Manage the preliminary project budget."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
