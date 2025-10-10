import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/types/document";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentDocumentsProps {
  documents: Document[];
  loading?: boolean;
}

export function RecentDocuments({
  documents,
  loading = false,
}: RecentDocumentsProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Recent Documents</h2>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link to="/documents">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No documents yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first document to see it here
            </p>
            <Button asChild>
              <Link to="/templates">Browse Templates</Link>
            </Button>
          </div>
        ) : (
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
                        doc.status === "Signed" &&
                          "border-green-500/50 text-green-600 bg-green-50",
                        doc.status === "Sent" &&
                          "border-blue-500/50 text-blue-600 bg-blue-50",
                        doc.status === "Created" &&
                          "border-yellow-500/50 text-yellow-600 bg-yellow-50",
                      )}
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.recipient || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="View Document"
                        asChild
                      >
                        <Link to={`/documents/${doc.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
