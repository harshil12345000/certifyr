
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';

interface RecentDocumentsProps {
  documents: Document[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium">Recent Documents</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {doc.name}
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      doc.status === 'Signed' && 'border-green-500/50 text-green-600 bg-green-50',
                      doc.status === 'Sent' && 'border-blue-500/50 text-blue-600 bg-blue-50',
                      doc.status === 'Created' && 'border-yellow-500/50 text-yellow-600 bg-yellow-50',
                    )}
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.recipient || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
