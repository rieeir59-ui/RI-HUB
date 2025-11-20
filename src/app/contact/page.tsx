
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const contactDetails = {
  address: 'Sector Y DHA Phase 3, 101 Lahore',
  phone: '(042) 35692522',
  email: 'info@isbahhassan.com',
};

const hours = [
    { day: 'Monday', time: '9:30 am–6 pm' },
    { day: 'Tuesday', time: '9 am–6 pm' },
    { day: 'Wednesday', time: '9 am–6 pm' },
    { day: 'Thursday', time: '9 am–6 pm' },
    { day: 'Friday', time: '9 am–6 pm' },
    { day: 'Saturday', time: '9 am–2 pm' },
    { day: 'Sunday', time: 'Closed' },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          
          <div className="flex flex-col justify-center animate-in fade-in-50 slide-in-from-left-10 duration-1000">
            <Card className="w-full h-full shadow-lg bg-accent/20">
              <CardHeader>
                <CardTitle className="text-4xl font-headline text-primary">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <span>{contactDetails.address}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <span>{contactDetails.phone}</span>
                  </div>
                   <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <span>{contactDetails.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                     <Clock className="h-6 w-6 text-primary" />
                     <h4 className="font-headline text-2xl text-primary">Hours</h4>
                  </div>
                  <ul className="space-y-1 pl-10">
                    {hours.map(item => (
                       <li key={item.day} className="flex justify-between">
                         <span className="font-semibold">{item.day}</span>
                         <span>{item.time}</span>
                       </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="relative min-h-[400px] md:min-h-full w-full rounded-lg overflow-hidden shadow-2xl animate-in fade-in-50 slide-in-from-right-10 duration-1000">
              <Image
                src="https://media.licdn.com/dms/image/D4D03AQGEUVKstFYOwg/profile-displayphoto-shrink_800_800/0/1714318142608?e=1725494400&v=beta&t=7gEE7Jq9xX_Yk_3R_a_E7B0z3A4g2H6aD6gI5p_t_o"
                alt="Isbah Hassan"
                layout="fill"
                objectFit="cover"
                className="object-top"
                priority
              />
          </div>

        </div>
      </main>
    </div>
  );
}
