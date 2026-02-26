import { useState, useRef, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
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
  ChevronRight,
  Sparkles,
  FileUp,
  X,
  Loader2,
  UploadCloud,
  File,
  FolderOpen
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

interface JsonUploadItem {
  id: string;
  data: {
    country: string;
    state?: string;
    authority: string;
    domain: string;
    official_name: string;
    description?: string;
    purpose?: string;
    who_must_file?: string;
    filing_method?: string;
    official_source_url?: string;
    official_pdf_url?: string;
    version?: string;
    required_fields?: Array<{
      field_name: string;
      field_label: string;
      field_type: string;
      required?: boolean;
      validation_regex?: string;
    }>;
    attachments_required?: Array<{
      attachment_name: string;
      is_required?: boolean;
      description?: string;
    }>;
    dependencies?: Array<{
      dependency_name: string;
      description?: string;
    }>;
  };
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

const SARVAM_PROMPT = `You are an expert legal document parser. Your task is to extract structured information from legal documents and return valid JSON.

EXTRACT THE FOLLOWING FIELDS (all strings unless specified):

1. country - The country this document belongs to (e.g., "United States", "India", "UK", "Canada", "Australia")
2. state - State/Province if applicable (e.g., "California", "Maharashtra")
3. authority - The government authority that issues this document (e.g., "IRS", "CBIC", "FSSAI", "California Secretary of State")
4. domain - The category/domain (e.g., "Taxation", "Business Registration", "Compliance", "Licensing", "Healthcare", "Food Safety", "MSME")
5. official_name - Full official name of the document/form
6. description - Detailed description of what this document is and its purpose
7. purpose - Why this document is required and what it accomplishes
8. who_must_file - Which entities/individuals are required to file this document
9. filing_method - How to file (online, mail, in-person, etc.)
10. official_source_url - URL to the official government source
11. official_pdf_url - URL to download the official PDF form
12. version - Current version of the form

REQUIRED FIELDS (array):
For each field that needs to be filled in the form, extract:
- field_name: technical name (e.g., "legal_name", "pan_number")
- field_label: human-readable label (e.g., "Legal Name", "PAN Number")
- field_type: one of "text", "number", "date", "email", "tel", "select", "checkbox", "radio", "textarea"
- required: true or false
- validation_regex: regex pattern if applicable (e.g., email, phone, PAN)

ATTACHMENTS REQUIRED (array):
- attachment_name: name of required attachment
- is_required: true or false
- description: what this attachment must contain

DEPENDENCIES (array):
- dependency_name: name of prerequisite document
- description: why it's needed

IMPORTANT:
- Return ONLY valid JSON, no explanations or markdown
- Use proper JSON array syntax for required_fields, attachments_required, dependencies
- If a field is not applicable, use null or omit it
- For field_type, prefer: text, number, date, email, tel, select, checkbox, radio, textarea
- Add validation_regex for: email (email format), phone (country-specific), PAN (India), SSN (US), Aadhaar (India), IFSC (India), GSTIN (India)`;

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
  
  // Upload dialog state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"json" | "pdf">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonUploadItems, setJsonUploadItems] = useState<JsonUploadItem[]>([]);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [pdfUploadStatus, setPdfUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [pdfUploadResult, setPdfUploadResult] = useState<{ success: boolean; message: string; document_id?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const { data, isLoading, refetch } = useLibraryDocuments({
    search: filters.search || undefined,
    page: filters.page,
    limit: 20,
    needsReview: filters.needsReview === "needs_review" ? true : filters.needsReview === "verified" ? false : undefined,
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

  // JSON Upload handlers
  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    
    // Try to parse and validate JSON
    try {
      const parsed = JSON.parse(e.target.value);
      if (Array.isArray(parsed)) {
        const items: JsonUploadItem[] = parsed.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          data: item,
          status: "pending" as const,
        }));
        setJsonUploadItems(items);
      } else {
        // Single object - wrap in array
        setJsonUploadItems([{
          id: `item-${Date.now()}`,
          data: parsed,
          status: "pending" as const,
        }]);
      }
    } catch {
      setJsonUploadItems([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const items: JsonUploadItem[] = parsed.map((item, idx) => ({
              id: `item-${Date.now()}-${idx}`,
              data: item,
              status: "pending" as const,
            }));
            setJsonUploadItems(items);
          } else {
            setJsonUploadItems([{
              id: `item-${Date.now()}`,
              data: parsed,
              status: "pending" as const,
            }]);
          }
        } catch {
          toast({ title: "Invalid JSON file", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setJsonInput(content);
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              const items: JsonUploadItem[] = parsed.map((item, idx) => ({
                id: `item-${Date.now()}-${idx}`,
                data: item,
                status: "pending" as const,
              }));
              setJsonUploadItems(items);
              toast({ title: `Loaded ${items.length} documents from file` });
            } else {
              setJsonUploadItems([{
                id: `item-${Date.now()}`,
                data: parsed,
                status: "pending" as const,
              }]);
              toast({ title: "Loaded 1 document from file" });
            }
          } catch {
            toast({ title: "Invalid JSON file", variant: "destructive" });
          }
        };
        reader.readAsText(file);
      } else {
        toast({ title: "Please drop a JSON file", variant: "destructive" });
      }
    }
  }, []);

  const processJsonWithSarvam = async (item: JsonUploadItem): Promise<JsonUploadItem> => {
    try {
      // Call the library-parse edge function with JSON content
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yjeeamhahyhfawwgebtd.supabase.co";
      const response = await fetch(`${supabaseUrl}/functions/v1/library-parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          json_content: JSON.stringify(item.data),
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return { ...item, status: "success" };
    } catch (error) {
      console.error("Sarvam AI error:", error);
      // If Sarvam fails, save directly to database
      try {
        const slug = generateSlug(item.data.official_name);
        const docData = {
          country: item.data.country,
          state: item.data.state || null,
          authority: item.data.authority,
          domain: item.data.domain,
          official_name: item.data.official_name,
          slug,
          short_description: item.data.description?.substring(0, 200) || null,
          full_description: item.data.description || null,
          purpose: item.data.purpose || null,
          who_must_file: item.data.who_must_file || null,
          filing_method: item.data.filing_method || null,
          official_source_url: item.data.official_source_url || null,
          official_pdf_url: item.data.official_pdf_url || null,
          version: item.data.version || "1.0",
          last_verified_at: new Date().toISOString(),
          parsing_confidence: 0.5,
          needs_review: true,
        };

        const { data: newDoc, error: insertError } = await supabase
          .from("library_documents")
          .insert(docData)
          .select()
          .single();

        if (insertError) throw insertError;

        // Add fields if present
        if (item.data.required_fields && newDoc) {
          const fieldsToInsert = item.data.required_fields.map(field => ({
            document_id: newDoc.id,
            field_name: field.field_name,
            field_label: field.field_label,
            field_type: field.field_type || "text",
            required: field.required ?? true,
            validation_regex: field.validation_regex || null,
          }));
          await supabase.from("library_fields").insert(fieldsToInsert);
        }

        // Add attachments if present
        if (item.data.attachments_required && newDoc) {
          const attachmentsToInsert = item.data.attachments_required.map(att => ({
            document_id: newDoc.id,
            attachment_name: att.attachment_name,
            is_required: att.is_required ?? true,
            description: att.description || null,
          }));
          await supabase.from("library_attachments").insert(attachmentsToInsert);
        }

        // Add dependencies if present
        if (item.data.dependencies && newDoc) {
          const depsToInsert = item.data.dependencies.map(dep => ({
            document_id: newDoc.id,
            dependency_name: dep.dependency_name,
            dependency_slug: null,
            description: dep.description || null,
          }));
          await supabase.from("library_dependencies").insert(depsToInsert);
        }

        return { ...item, status: "success" };
      } catch (dbError) {
        return { 
          ...item, 
          status: "error", 
          error: dbError instanceof Error ? dbError.message : "Unknown error" 
        };
      }
    }
  };

  const handleProcessJsonUpload = async () => {
    if (jsonUploadItems.length === 0) {
      toast({ title: "No valid JSON to process", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    const results: JsonUploadItem[] = [];
    
    for (let i = 0; i < jsonUploadItems.length; i++) {
      setUploadProgress(Math.round(((i + 1) / jsonUploadItems.length) * 100));
      const result = await processJsonWithSarvam(jsonUploadItems[i]);
      results.push(result);
      setJsonUploadItems(prev => prev.map((item, idx) => idx === i ? result : item));
    }

    setIsProcessing(false);
    
    const successCount = results.filter(r => r.status === "success").length;
    const errorCount = results.filter(r => r.status === "error").length;
    
    toast({ 
      title: "Upload Complete", 
      description: `Successfully processed ${successCount} document(s). ${errorCount} failed.` 
    });
    
    if (successCount > 0) {
      refetch();
      setJsonInput("");
      setJsonUploadItems([]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // PDF Upload handlers
  const handlePdfUrlSubmit = async () => {
    if (!pdfUrlInput.trim()) {
      toast({ title: "Please enter a PDF URL", variant: "destructive" });
      return;
    }

    setPdfUploadStatus("processing");
    setPdfUploadResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yjeeamhahyhfawwgebtd.supabase.co";
      const response = await fetch(`${supabaseUrl}/functions/v1/library-parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          pdf_url: pdfUrlInput.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setPdfUploadStatus("success");
      setPdfUploadResult({
        success: true,
        message: "Document parsed and created successfully!",
        document_id: result.document_id
      });
      refetch();
    } catch (error) {
      setPdfUploadStatus("error");
      setPdfUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to process PDF"
      });
    }
  };

  const resetUploadDialog = () => {
    setJsonInput("");
    setJsonUploadItems([]);
    setPdfUrlInput("");
    setPdfUploadStatus("idle");
    setPdfUploadResult(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload JSON/PDF
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
                            value={formData.country || "placeholder"} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, country: v === "placeholder" ? "" : v }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placeholder" disabled>Select country</SelectItem>
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
                            value={formData.domain || "placeholder"}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, domain: v === "placeholder" ? "" : v }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placeholder" disabled>Select domain</SelectItem>
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
              value={filters.needsReview || "all"} 
              onValueChange={(v) => setFilters(prev => ({ ...prev, needsReview: v === "all" ? "" : v, page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        setIsUploadDialogOpen(open);
        if (!open) resetUploadDialog();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI-Powered Document Upload
            </DialogTitle>
            <DialogDescription>
              Upload JSON files or provide PDF URLs. Sarvam AI will parse and extract document information automatically.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "json" | "pdf")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON Upload
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PDF URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                    <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-lg">
                      {isDragging ? "Drop your file here" : "Drag & drop JSON files here"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click the button below to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".json,application/json"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-file-upload"
                    multiple
                  />
                  <label htmlFor="json-file-upload">
                    <Button 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }}
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Supports single or bulk JSON uploads (.json)
                  </p>
                </div>
              </div>

              {/* Show selected files */}
              {selectedFile && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileJson className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or paste JSON</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Paste JSON Content</Label>
                <Textarea
                  placeholder='[{"country": "India", "authority": "CBIC", "domain": "Taxation", "official_name": "GST Registration", ...}]'
                  value={jsonInput}
                  onChange={handleJsonInputChange}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              {jsonUploadItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Documents to Upload ({jsonUploadItems.length})</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {jsonUploadItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-0">
                        <div>
                          <div className="font-medium">{item.data.official_name || `Document ${idx + 1}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.data.country} • {item.data.authority} • {item.data.domain}
                          </div>
                        </div>
                        {item.status === "pending" && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        {item.status === "processing" && (
                          <Badge variant="secondary">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing
                          </Badge>
                        )}
                        {item.status === "success" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {item.status === "error" && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button 
                onClick={handleProcessJsonUpload} 
                disabled={jsonUploadItems.length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing {jsonUploadItems.length} document(s)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Process with Sarvam AI
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                <strong>Expected JSON format:</strong>
                <pre className="mt-2 whitespace-pre-wrap">{`{
  "country": "India",
  "state": "Maharashtra",
  "authority": "CBIC",
  "domain": "Taxation",
  "official_name": "GST Registration",
  "description": "Register for GST...",
  "purpose": "To collect GST...",
  "who_must_file": "Businesses > 40L",
  "filing_method": "Online",
  "official_source_url": "https://...",
  "official_pdf_url": "https://...",
  "version": "1.0",
  "required_fields": [
    {"field_name": "pan", "field_label": "PAN Number", "field_type": "text", "required": true}
  ],
  "attachments_required": [
    {"attachment_name": "Address Proof", "is_required": true}
  ],
  "dependencies": [
    {"dependency_name": "PAN Card"}
  ]
}`}</pre>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-4">
              <div className="space-y-2">
                <Label>PDF URL</Label>
                <Input
                  placeholder="https://example.com/form.pdf"
                  value={pdfUrlInput}
                  onChange={(e) => setPdfUrlInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the URL of a publicly accessible PDF form. Sarvam AI will analyze and extract the form fields.
                </p>
              </div>

              {pdfUploadStatus === "processing" && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                    <p className="text-muted-foreground">Analyzing PDF with Sarvam AI...</p>
                    <p className="text-xs text-muted-foreground">This may take a moment</p>
                  </div>
                </div>
              )}

              {pdfUploadStatus === "success" && pdfUploadResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Success!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">{pdfUploadResult.message}</p>
                  {pdfUploadResult.document_id && (
                    <Button 
                      variant="link" 
                      className="mt-2 p-0 h-auto text-green-700"
                      onClick={() => {
                        setIsUploadDialogOpen(false);
                        navigate(`/library`);
                      }}
                    >
                      View in Library →
                    </Button>
                  )}
                </div>
              )}

              {pdfUploadStatus === "error" && pdfUploadResult && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{pdfUploadResult.message}</p>
                </div>
              )}

              <Button 
                onClick={handlePdfUrlSubmit}
                disabled={!pdfUrlInput.trim() || pdfUploadStatus === "processing"}
                className="w-full"
              >
                {pdfUploadStatus === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze PDF with Sarvam AI
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                <strong>Note:</strong> PDF analysis uses Sarvam AI to extract form fields, validation rules, and document metadata. 
                The AI will attempt to identify all required fields, their types, and any conditional logic.
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
