import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/types/document";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="p-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {doc.type} • {doc.date}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2",
                        doc.status === "Signed" &&
                          "border-green-500/50 text-green-600 bg-green-50",
                        doc.status === "Sent" &&
                          "border-blue-500/50 text-blue-600 bg-blue-50",
                        doc.status === "Created" &&
                          "border-yellow-500/50 text-yellow-600 bg-yellow-50"
                      )}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  {doc.recipient && (
                    <CardDescription className="mt-2">
                      To: {doc.recipient}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="default" size="sm" className="w-full" asChild>
                    <Link to={`/documents/${doc.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
