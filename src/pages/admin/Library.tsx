import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLibraryDocuments, LibraryDocument, useLibraryTags } from "@/hooks/useLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  FileJson, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface LibraryFormData {
  country: string;
  state: string;
  authority: string;
  domain: string;
  official_name: string;
  short_description: string;
  full_description: string;
  purpose: string;
  who_must_file: string;
  filing_method: string;
  official_source_url: string;
  official_pdf_url: string;
  version: string;
}

const initialFormData: LibraryFormData = {
  country: "",
  state: "",
  authority: "",
  domain: "",
  official_name: "",
  short_description: "",
  full_description: "",
  purpose: "",
  who_must_file: "",
  filing_method: "",
  official_source_url: "",
  official_pdf_url: "",
  version: "1.0",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminLibrary() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: "", page: 1, needsReview: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LibraryDocument | null>(null);
  const [formData, setFormData] = useState<LibraryFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, refetch } = useLibraryDocuments({
    search: filters.search || undefined,
    page: filters.page,
    limit: 20,
  });

  const { data: tags } = useLibraryTags();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = editingDoc?.slug || generateSlug(formData.official_name);
      
      const docData = {
        ...formData,
        slug,
        state: formData.state || null,
        last_verified_at: new Date().toISOString(),
        parsing_confidence: 0.95,
        needs_review: false,
      };

      if (editingDoc) {
        const { error } = await supabase
          .from("library_documents")
          .update(docData)
          .eq("id", editingDoc.id);

        if (error) throw error;
        toast({ title: "Document updated successfully" });
      } else {
        const { error } = await supabase
          .from("library_documents")
          .insert([docData]);

        if (error) throw error;
        toast({ title: "Document created successfully" });
      }

      setIsDialogOpen(false);
      setEditingDoc(null);
      setFormData(initialFormData);
      refetch();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ 
        title: "Error", 
        description: err.message || "Failed to save document", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doc: LibraryDocument) => {
    setEditingDoc(doc);
    setFormData({
      country: doc.country,
      state: doc.state || "",
      authority: doc.authority,
      domain: doc.domain,
      official_name: doc.official_name,
      short_description: doc.short_description || "",
      full_description: doc.full_description || "",
      purpose: doc.purpose || "",
      who_must_file: doc.who_must_file || "",
      filing_method: doc.filing_method || "",
      official_source_url: doc.official_source_url || "",
      official_pdf_url: doc.official_pdf_url || "",
      version: doc.version,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const { error } = await supabase
        .from("library_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Document deleted successfully" });
      refetch();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete document", 
        variant: "destructive" 
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Legal Library Admin</h1>
              <p className="text-muted-foreground mt-1">
                Manage legal documents, forms, and compliance requirements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/library")}>
                <Eye className="w-4 h-4 mr-2" />
                View Public Library
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingDoc(null);
                  setFormData(initialFormData);
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDoc ? "Edit Document" : "Add New Document"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingDoc 
                          ? "Update the document details below." 
                          : "Enter the legal document details. You can also upload JSON for bulk import."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Select 
                            value={formData.country} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, country: v }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="UK">UK</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State (optional)</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="e.g., California"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="authority">Authority *</Label>
                          <Input
                            id="authority"
                            value={formData.authority}
                            onChange={(e) => setFormData(prev => ({ ...prev, authority: e.target.value }))}
                            placeholder="e.g., IRS"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="domain">Domain *</Label>
                          <Select 
                            value={formData.domain}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, domain: v }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Taxation">Taxation</SelectItem>
                              <SelectItem value="Business Registration">Business Registration</SelectItem>
                              <SelectItem value="Compliance">Compliance</SelectItem>
                              <SelectItem value="Licensing">Licensing</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                              <SelectItem value="Food Safety">Food Safety</SelectItem>
                              <SelectItem value="MSME">MSME</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="official_name">Official Name *</Label>
                        <Input
                          id="official_name"
                          value={formData.official_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, official_name: e.target.value }))}
                          placeholder="e.g., Employer Identification Number (EIN) Application"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="short_description">Short Description</Label>
                        <Input
                          id="short_description"
                          value={formData.short_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                          placeholder="Brief summary (2 lines max)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_description">Full Description</Label>
                        <Textarea
                          id="full_description"
                          value={formData.full_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                          placeholder="Detailed description of the document"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose</Label>
                        <Textarea
                          id="purpose"
                          value={formData.purpose}
                          onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                          placeholder="Why is this document required?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="who_must_file">Who Must File</Label>
                        <Textarea
                          id="who_must_file"
                          value={formData.who_must_file}
                          onChange={(e) => setFormData(prev => ({ ...prev, who_must_file: e.target.value }))}
                          placeholder="Which entities/individuals must file this?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="filing_method">Filing Method</Label>
                        <Textarea
                          id="filing_method"
                          value={formData.filing_method}
                          onChange={(e) => setFormData(prev => ({ ...prev, filing_method: e.target.value }))}
                          placeholder="How to file (online, mail, etc.)"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="official_source_url">Official Source URL</Label>
                          <Input
                            id="official_source_url"
                            value={formData.official_source_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, official_source_url: e.target.value }))}
                            placeholder="https://..."
                            type="url"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="official_pdf_url">Official PDF URL</Label>
                          <Input
                            id="official_pdf_url"
                            value={formData.official_pdf_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, official_pdf_url: e.target.value }))}
                            placeholder="https://..."
                            type="url"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="version">Version</Label>
                        <Input
                          id="version"
                          value={formData.version}
                          onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                          placeholder="1.0"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : (editingDoc ? "Update" : "Create")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
            </div>
            <Select 
              value={filters.needsReview} 
              onValueChange={(v) => setFilters(prev => ({ ...prev, needsReview: v, page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Documents</SelectItem>
                <SelectItem value="true">Needs Review</SelectItem>
                <SelectItem value="false">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                data?.documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.official_name}</TableCell>
                    <TableCell>{doc.country}{doc.state && `, ${doc.state}`}</TableCell>
                    <TableCell>{doc.authority}</TableCell>
                    <TableCell>{doc.domain}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>
                      {doc.parsing_confidence 
                        ? `${(doc.parsing_confidence * 100).toFixed(0)}%`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {doc.needs_review ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Review
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/library/${doc.slug}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(doc)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= data.pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
