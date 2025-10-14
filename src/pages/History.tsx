import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, FileText } from "lucide-react";
import { useDocumentHistory } from "@/hooks/useDocumentHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
export default function History() {
  const navigate = useNavigate();
  const {
    history,
    loading,
    deleteDocument
  } = useDocumentHistory();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const handleDelete = async () => {
    if (deleteId) {
      await deleteDocument(deleteId);
      setDeleteId(null);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-3xl font-bold">Document History</h1>
            <p className="text-muted-foreground">
              View and manage your saved documents
            </p>
          </div>
        </div>

        {loading ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>)}
          </div> : history.length === 0 ? <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No saved documents yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Save documents from the preview to see them here
              </p>
              <Button onClick={() => navigate("/documents")}>
                Create Document
              </Button>
            </CardContent>
          </Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map(item => <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {item.document_name} for {item.form_data?.fullName || item.form_data?.employeeName || item.form_data?.studentName || "Unknown"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(item.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1" onClick={() => navigate(`/documents/${item.template_id}`, {
                state: {
                  historyData: item
                }
              })}>
                      Open
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                saved document from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>;
}