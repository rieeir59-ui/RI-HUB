
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'architects-instructions');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Architects Instructions"
        description="Review and manage architect instructions."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
