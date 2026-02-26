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
  data: Record<string, unknown>;
  rawContent?: string;
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
    
    const rawContent = e.target.value;
    
    if (rawContent.trim()) {
      setJsonUploadItems([{
        id: `item-${Date.now()}`,
        data: {},
        rawContent: rawContent,
        status: "pending" as const,
      }]);
    } else {
      setJsonUploadItems([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Handle multiple files
    const jsonFiles = Array.from(files).filter(file => 
      file.type === "application/json" || 
      file.name.endsWith(".json") ||
      file.name.toLowerCase().endsWith(".json")
    );
    
    if (jsonFiles.length === 0) {
      toast({ title: "No JSON files selected. Please select .json files.", variant: "destructive" });
      return;
    }

    let processedCount = 0;
    const newItems: JsonUploadItem[] = [];

    jsonFiles.forEach((file, fileIdx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          const parsed = JSON.parse(content);
          
          if (Array.isArray(parsed)) {
            // It's an array of documents
            parsed.forEach((item, idx) => {
              newItems.push({
                id: `item-${Date.now()}-${fileIdx}-${idx}`,
                data: item,
                status: "pending" as const,
              });
            });
          } else if (typeof parsed === 'object' && parsed !== null) {
            // It's a single document object
            newItems.push({
              id: `item-${Date.now()}-${fileIdx}`,
              data: parsed,
              status: "pending" as const,
            });
          }
        } catch (parseError) {
          console.error("Error parsing file:", file.name, parseError);
        }
        
        processedCount++;
        if (processedCount === jsonFiles.length) {
          // All files processed
          setJsonInput(JSON.stringify(newItems.map(item => item.data), null, 2));
          setJsonUploadItems(newItems);
          if (newItems.length > 0) {
            toast({ title: `Loaded ${newItems.length} document(s) from ${jsonFiles.length} file(s)` });
          } else {
            toast({ title: "No valid JSON found in files", variant: "destructive" });
          }
        }
      };
      reader.readAsText(file);
    });
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
      // Accept any file type on drop - try to parse as JSON
      const jsonFiles = Array.from(files).filter(file => 
        file.type === "application/json" || 
        file.name.endsWith(".json") ||
        file.name.toLowerCase().endsWith(".json") ||
        file.type === "" || // Unknown type
        file.type === "text/plain" // Sometimes JSON files are detected as text
      );
      
      if (jsonFiles.length === 0) {
        // Try all dropped files as JSON anyway
        const allFiles = Array.from(files);
        processDroppedFiles(allFiles);
        return;
      }
      
      processDroppedFiles(jsonFiles);
    }
  }, []);

  const processDroppedFiles = (files: File[]) => {
    let processedCount = 0;
    const newItems: JsonUploadItem[] = [];

    files.forEach((file, fileIdx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        newItems.push({
          id: `item-${Date.now()}-${fileIdx}`,
          data: {},
          rawContent: content,
          status: "pending" as const,
        });
        
        processedCount++;
        if (processedCount === files.length) {
          setJsonInput(content);
          setJsonUploadItems(newItems);
          if (newItems.length > 0) {
            toast({ title: `Loaded ${newItems.length} document(s) - will parse with Sarvam AI` });
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const processJsonWithSarvam = async (item: JsonUploadItem): Promise<JsonUploadItem> => {
    try {
      // Call the library-parse edge function with JSON content
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yjeeamhahyhfawwgebtd.supabase.co";
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || "";

      const response = await fetch(`${supabaseUrl}/functions/v1/library-parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          json_content: item.rawContent || JSON.stringify(item.data),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Edge function error response:", errorText);
        let parsedError = errorText;
        try {
          const parsed = JSON.parse(errorText);
          parsedError = parsed.error || parsed.details || errorText;
        } catch {}
        throw new Error(`HTTP ${response.status}: ${parsedError}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return { ...item, status: "success" };
    } catch (error) {
      console.error("Sarvam AI error, falling back to direct save:", error);
      
      // Parse from rawContent if data is empty
      let data = item.data;
      if (Object.keys(data).length === 0 && item.rawContent) {
        try {
          data = JSON.parse(item.rawContent);
        } catch {
          // If rawContent is not valid JSON, try to extract info from text
          data = {};
        }
      }
      
      const getField = (possibleNames: string[]): string | undefined => {
        for (const name of possibleNames) {
          const value = data[name];
          if (typeof value === 'string' && value.trim()) return value.trim();
          // Also check case-insensitive
          const lowerName = name.toLowerCase();
          for (const [key, val] of Object.entries(data)) {
            if (key.toLowerCase() === lowerName && typeof val === 'string' && val.trim()) {
              return val.trim();
            }
          }
        }
        return undefined;
      };

      // Try to extract document info with flexible field names
      const country = getField(['country', 'Country', 'COUNTRY', 'nation', 'CountryName']) || "Unknown";
      const authority = getField(['authority', 'Authority', 'AUTHORITY', 'issuingAuthority', 'issuing_authority', 'agency', 'Agency']) || "Unknown";
      const domain = getField(['domain', 'Domain', 'DOMAIN', 'category', 'Category', 'type', 'Type']) || "Compliance";
      const officialName = getField(['official_name', 'officialName', 'name', 'Name', 'documentName', 'document_name', 'formName', 'form_name', 'title', 'Title']) || "Untitled Document";
      const description = getField(['description', 'Description', 'DESC', 'shortDescription', 'short_description', 'summary', 'Summary']) || "";
      const purpose = getField(['purpose', 'Purpose', 'PURPOSE', 'reason', 'Reason', 'whyRequired', 'why_required']) || "";
      const whoMustFile = getField(['who_must_file', 'whoMustFile', 'eligibility', 'Eligibility', 'whoCanApply', 'who_can_apply', 'applicableTo', 'applicable_to']) || "";
      const filingMethod = getField(['filing_method', 'filingMethod', 'howToFile', 'how_to_file', 'method', 'Method', 'submissionMethod', 'submission_method']) || "";
      const sourceUrl = getField(['official_source_url', 'officialSourceUrl', 'sourceUrl', 'source_url', 'websiteUrl', 'website_url', 'url', 'URL', 'link', 'Link']) || "";
      const pdfUrl = getField(['official_pdf_url', 'officialPdfUrl', 'pdfUrl', 'pdf_url', 'formUrl', 'form_url', 'downloadUrl', 'download_url']) || "";
      const version = getField(['version', 'Version', 'VERSION', 'ver', 'v']) || "1.0";
      const state = getField(['state', 'State', 'STATE', 'province', 'Province']) || "";

      // Try to save directly to database
      try {
        const slug = generateSlug(officialName);
        const docData = {
          country,
          state: state || null,
          authority,
          domain,
          official_name: officialName,
          slug,
          short_description: description?.substring(0, 200) || null,
          full_description: description || null,
          purpose: purpose || null,
          who_must_file: whoMustFile || null,
          filing_method: filingMethod || null,
          official_source_url: sourceUrl || null,
          official_pdf_url: pdfUrl || null,
          version,
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

        // Try to extract and save fields if present
        const fieldsData = data.required_fields || data.fields || data.fieldsRequired || data.requiredFields || [];
        if (Array.isArray(fieldsData) && fieldsData.length > 0 && newDoc) {
          const fieldsToInsert = fieldsData.map((field: any) => ({
            document_id: newDoc.id,
            field_name: field.field_name || field.fieldName || field.name || "field",
            field_label: field.field_label || field.fieldLabel || field.label || field.name || "Field",
            field_type: field.field_type || field.fieldType || field.type || "text",
            required: field.required ?? field.required ?? true,
            validation_regex: field.validation_regex || field.validationRegex || null,
          }));
          await supabase.from("library_fields").insert(fieldsToInsert);
        }

        // Try to extract attachments
        const attachmentsData = data.attachments_required || data.attachments || data.requiredAttachments || data.attachmentsRequired || [];
        if (Array.isArray(attachmentsData) && attachmentsData.length > 0 && newDoc) {
          const attachmentsToInsert = attachmentsData.map((att: any) => ({
            document_id: newDoc.id,
            attachment_name: att.attachment_name || att.attachmentName || att.name || "Attachment",
            is_required: att.is_required ?? att.isRequired ?? att.required ?? true,
            description: att.description || null,
          }));
          await supabase.from("library_attachments").insert(attachmentsToInsert);
        }

        // Try to extract dependencies
        const depsData = data.dependencies || data.dependsOn || data.prerequisites || [];
        if (Array.isArray(depsData) && depsData.length > 0 && newDoc) {
          const depsToInsert = depsData.map((dep: any) => ({
            document_id: newDoc.id,
            dependency_name: dep.dependency_name || dep.name || dep.dependency || "Dependency",
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
          error: dbError instanceof Error ? dbError.message : "Failed to save document" 
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
                          <div className="font-medium">{String(item.data.official_name || item.data.name || item.data.title || `Document ${idx + 1}`)}</div>
                          <div className="text-xs text-muted-foreground">
                            {String(item.data.country || item.data.country || '')} • {String(item.data.authority || item.data.agency || '')} • {String(item.data.domain || item.data.category || '')}
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
                <strong>Accepted JSON format (flexible - any of these work):</strong>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li><code>country</code> / <code>Country</code> / <code>nation</code></li>
                  <li><code>authority</code> / <code>Agency</code> / <code>issuingAuthority</code></li>
                  <li><code>domain</code> / <code>Category</code> / <code>Type</code></li>
                  <li><code>official_name</code> / <code>name</code> / <code>documentName</code> / <code>title</code></li>
                  <li><code>description</code> / <code>summary</code></li>
                  <li><code>purpose</code> / <code>reason</code></li>
                  <li><code>who_must_file</code> / <code>eligibility</code></li>
                  <li><code>filing_method</code> / <code>howToFile</code> / <code>method</code></li>
                  <li><code>official_source_url</code> / <code>url</code> / <code>websiteUrl</code></li>
                  <li><code>official_pdf_url</code> / <code>pdfUrl</code> / <code>downloadUrl</code></li>
                </ul>
                <p className="mt-2 text-yellow-600">
                  If Sarvam AI fails, the system auto-maps any JSON format!
                </p>
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
