
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'payment-certificates');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Payment Certificates"
        description="Issue and manage payment certificates."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
    </div>
  );
}
