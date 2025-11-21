
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'project-checklist');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Project Checklist"
        description="Track project tasks with a checklist."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
