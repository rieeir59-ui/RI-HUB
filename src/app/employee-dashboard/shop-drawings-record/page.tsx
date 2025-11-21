
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'shop-drawings-record');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Shop Drawings Record"
        description="Maintain a record of all shop drawings."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
