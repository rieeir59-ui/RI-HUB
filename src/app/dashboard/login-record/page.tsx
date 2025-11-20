import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const loginRecords = [
  { user: 'Isbah Hassan', ip: '192.168.1.1', time: '2024-07-29 09:05 AM', status: 'Success' },
  { user: 'Ahmad Khan', ip: '192.168.1.5', time: '2024-07-29 09:02 AM', status: 'Success' },
  { user: 'Unknown', ip: '10.0.5.21', time: '2024-07-29 08:55 AM', status: 'Failed' },
];


export default function LoginRecordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login Records</CardTitle>
        <CardDescription>Recent login activity for all users.</CardDescription>
      </CardHeader>
      <CardContent>
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.user}</TableCell>
                <TableCell>{record.ip}</TableCell>
                <TableCell>{record.time}</TableCell>
                <TableCell>
                  <Badge variant={record.status === 'Success' ? 'default' : 'destructive'} className={record.status === 'Success' ? 'bg-green-600' : ''}>
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
