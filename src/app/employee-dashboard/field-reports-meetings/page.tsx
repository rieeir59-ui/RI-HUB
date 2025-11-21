
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'field-reports-meetings');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Field Reports/Meetings"
        description="Access and manage field reports and meeting minutes."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
