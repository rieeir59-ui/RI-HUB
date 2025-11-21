
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'predesign-assessment');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Predesign Assessment"
        description="Conduct and review predesign assessments."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
