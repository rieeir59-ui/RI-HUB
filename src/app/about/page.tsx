
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 md:py-24 space-y-8">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-headline text-primary">About Us</CardTitle>
              <CardContent className="text-base md:text-lg text-muted-foreground pt-4">
                <p>
                  Isbah Hassan & Associates (Pvt.) Ltd. offers elegant and innovative architecture and interior design solutions to meet the most discerning requirements.
                </p>
              </CardContent>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-xl font-semibold">Our Philosophy</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left">
                    Whether it’s a high-rise, a housing development, an amusement park or a campus, our holistic approach ensures that buildings are stylish, practical, comfortable and in perfect harmony with their indigenous surroundings. With over 25 years of experience working on complex projects ranging from office buildings and interiors to industrial constructions and private residences, we have developed a sophisticated and thorough approach towards design, technical development, code analysis, and document production that seamlessly blends functionality with aesthetics.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-xl font-semibold">Our Approach</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left">
                    Mindful of developments that influence 21st century architecture, we opt for stylised, space efficient and financially viable buildings fuelled by a unique vision using state of the art technological advancements and innovative materials while cultivating respect for the environment. We believe in functional elegance and responsiveness to a site’s physical surroundings keeping the client’s needs and requirements in perspective within the approved budget. This formula has transpired into various successful developments that now line an emerging modern landscape in Pakistan, and we are proud to be part of this renaissance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-xl font-semibold">Collaboration</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground text-left space-y-4">
                    <p>
                      We believe that all projects benefit from a process involving the client, architect, builder and various specialists in an informative collaboration, and that successful projects are made possible through the management of all participants involved. We encourage this collaboration and act as a guide through the process of design and construction so that each project benefits from the participation and strengths of each team member.
                    </p>
                    <p>
                      We work with an array of the finest associates and specialists across Pakistan for project management, structural engineering, electrical engineering, public health engineering, geo- technical surveying, bill of quantities, HVAC, landscaping, environmental protection, energy design, security, and financial advising. Internationally, our associates include Shankland Cox Ltd. [UK and UAE], Tessa Kennedy Design Ltd. [UK], Jimmy Lim Design [Malaysia], Leigh & Orange Ltd. [Hong Kong], and Curtain Wall Consultants [China].
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
