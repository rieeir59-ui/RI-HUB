
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'construction-change-director');

  return (
    <div>
      <DashboardPageHeader
        title="Construction Change Director"
        description="Oversee and direct construction changes."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
