
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'project-data');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Project Data"
        description="A comprehensive data sheet for the project."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
