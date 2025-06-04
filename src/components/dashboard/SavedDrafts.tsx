
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, MoreHorizontal, Loader2, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type DocumentDraft = {
  id: string;
  name: string;
  template_id: string;
  created_at: string;
  updated_at: string;
};

export function SavedDrafts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      if (!user) {
        setDrafts([]);
        setLoading(false);
        return;
      }

      try {
        // For now, we'll use mock data since the table might not exist yet
        const mockDrafts: DocumentDraft[] = [
          {
            id: '1',
            name: 'Sample Draft 1',
            template_id: 'bonafide',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setDrafts(mockDrafts);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        setDrafts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [user]);

  const deleteDraft = async (id: string) => {
    try {
      setDrafts(drafts.filter(draft => draft.id !== id));
      
      toast({
        title: "Draft deleted",
        description: "The draft has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting draft",
        description: error.message || "There was an error deleting the draft.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Drafts</CardTitle>
          <CardDescription>Your recently saved document drafts</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Drafts</CardTitle>
          <CardDescription>Sign in to see your saved drafts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">Sign in to save and access your document drafts from anywhere</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Drafts</CardTitle>
          <CardDescription>Your recently saved document drafts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">You don't have any saved drafts yet</p>
          <Button asChild>
            <Link to="/templates">Create Document</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Saved Drafts</CardTitle>
          <CardDescription>Your recently saved document drafts</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/templates">
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{draft.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild title="Edit Draft">
                  <Link to={`/templates/${draft.template_id}`}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteDraft(draft.id)} className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
