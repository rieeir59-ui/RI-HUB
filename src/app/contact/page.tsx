import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12 md:py-24">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-3xl font-headline text-center">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-center text-muted-foreground">
              <p>
                Get in touch with our team for your next project.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
