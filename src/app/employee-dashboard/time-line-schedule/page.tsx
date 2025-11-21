
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'time-line-schedule');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Time line Schedule"
        description="View and manage the project timeline."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
