import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="space-y-8">
      <Card className="bg-card/90">
          <CardHeader>
              <CardTitle className="font-headline text-4xl text-center text-primary">Project Bylaws</CardTitle>
          </CardHeader>
      </Card>
    </div>
  );
}