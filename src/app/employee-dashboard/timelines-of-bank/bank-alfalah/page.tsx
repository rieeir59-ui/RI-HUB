
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'hero-architecture');

  return (
    <div>
      <DashboardPageHeader
        title="Bank Alfalah Timeline"
        description="Timeline for Bank Alfalah projects."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
