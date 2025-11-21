
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'continuation-sheet');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Continuation Sheet"
        description="Manage continuation sheets for project documentation."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
