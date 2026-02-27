import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useLibraryDocument, LibraryTag, LibraryField, LibraryDependency, LibraryAttachment } from "@/hooks/useLibrary";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  ExternalLink, 
  FileDown, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Globe, 
  MapPin, 
  FileText, 
  Link2,
  Paperclip,
  ListChecks,
  AlertCircle,
  FilePlus,
  Download,
  Eye,
  Loader2,
  Wand2
} from "lucide-react";
import { openPdfInNewTab } from "@/lib/pdf-utils";

import { countries, getFlagUrl } from '../lib/countries';

const COUNTRY_FLAGS: Record<string, string> = Object.fromEntries(
  countries.map(c => [c.name, getFlagUrl(c.name)])
);

const TAG_COLORS: Record<string, string> = {
  country: "bg-blue-50 border-blue-300 text-blue-700",
  state: "bg-gray-50 border-gray-300 text-gray-700",
  domain: "bg-purple-50 border-purple-300 text-purple-700",
  authority: "bg-green-50 border-green-300 text-green-700",
  industry: "bg-orange-50 border-orange-300 text-orange-700",
};

function TagBadge({ tag }: { tag: LibraryTag }) {
  return (
    <Badge variant="outline" className={`${TAG_COLORS[tag.tag_type]} border text-sm`}>
      {tag.tag_type === "country" && <Globe className="w-3 h-3 mr-1" />}
      {tag.tag_type === "state" && <MapPin className="w-3 h-3 mr-1" />}
      {tag.tag_type === "domain" && <FileText className="w-3 h-3 mr-1" />}
      {tag.tag_type === "authority" && <Building2 className="w-3 h-3 mr-1" />}
      {tag.tag_name}
    </Badge>
  );
}

function FieldsTable({ fields }: { fields: LibraryField[] }) {
  if (!fields.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          Required Fields
        </CardTitle>
        <CardDescription>
          Fields that must be filled when completing this form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Field Name</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Required</th>
                <th className="text-left py-3 px-4 font-medium">Conditional</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="font-medium">{field.field_label}</div>
                    <div className="text-xs text-muted-foreground">{field.field_name}</div>
                  </td>
                  <td className="py-3 px-4 text-sm capitalize">{field.field_type}</td>
                  <td className="py-3 px-4">
                    {field.required ? (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {field.conditional_logic ? (
                      <span className="text-muted-foreground">
                        {JSON.stringify(field.conditional_logic)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DependenciesSection({ dependencies }: { dependencies: LibraryDependency[] }) {
  if (!dependencies.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Dependencies
        </CardTitle>
        <CardDescription>
          Other documents or forms that may be required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dependencies.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">{dep.dependency_name}</div>
                {dep.description && (
                  <div className="text-sm text-muted-foreground">{dep.description}</div>
                )}
              </div>
              {dep.dependency_slug && (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/library/${dep.dependency_slug}`}>
                    View
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AttachmentsSection({ attachments }: { attachments: LibraryAttachment[] }) {
  if (!attachments.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Required Attachments
        </CardTitle>
        <CardDescription>
          Documents that must be uploaded with this form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{att.attachment_name}</div>
                  {att.description && (
                    <div className="text-sm text-muted-foreground">{att.description}</div>
                  )}
                </div>
              </div>
              {att.is_required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LibraryFormTabProps {
  document: {
    id: string;
    official_name: string;
    form_name?: string | null;
    short_description: string | null;
    authority: string;
    country: string;
    state: string | null;
    domain: string;
    official_pdf_url: string | null;
  };
  fields: LibraryField[];
}

function LibraryFormTab({ document, fields }: LibraryFormTabProps) {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);
  const [filledPdfUrl, setFilledPdfUrl] = useState<string | null>(null);
  const [isFillingPdf, setIsFillingPdf] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [pdfFieldsDebug, setPdfFieldsDebug] = useState<string[]>([]);
  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formSchema = z.object(
    fields.reduce((acc, field) => {
      if (field.field_type === "checkbox") {
        acc[field.field_name] = z.boolean().optional();
      } else {
        acc[field.field_name] = field.required 
          ? z.string().min(1, { message: `${field.field_label} is required` })
          : z.string().optional();
      }
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.field_name] = field.field_type === "checkbox" ? false : "";
      return acc;
    }, {} as Record<string, any>),
  });

  const watchedValues = form.watch();

  // Fetch original PDF bytes once
  useEffect(() => {
    if (!document.official_pdf_url) return;
    
    const fetchPdf = async () => {
      try {
        const response = await fetch(document.official_pdf_url!);
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const arrayBuffer = await response.arrayBuffer();
        pdfBytesRef.current = new Uint8Array(arrayBuffer);
        
        // Debug: extract field names from PDF
        try {
          const pdfDoc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true });
          const pdfForm = pdfDoc.getForm();
          const pdfFields = pdfForm.getFields();
          const fieldNames = pdfFields.map(f => f.getName());
          console.log("PDF Fields found:", fieldNames);
          setPdfFieldsDebug(fieldNames);
        } catch (e) {
          console.log("Could not extract PDF fields:", e);
          setPdfFieldsDebug([]);
        }
        
        // Show the original PDF immediately
        setFilledPdfUrl(document.official_pdf_url!);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setPdfLoadError("Could not load the official PDF. It may be blocked by CORS.");
        // Still show via iframe direct URL as fallback
        setFilledPdfUrl(document.official_pdf_url!);
      }
    };
    fetchPdf();
  }, [document.official_pdf_url]);

  // Fill PDF form fields whenever watched values change
  const fillPdfWithValues = useCallback(async (values: Record<string, any>) => {
    if (!pdfBytesRef.current) return;

    setIsFillingPdf(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true });
      const pdfForm = pdfDoc.getForm();
      const pdfFields = pdfForm.getFields();
      console.log("=== PDF FILLING DEBUG ===");
      console.log("Form fields in PDF:", pdfFields.map(f => f.getName()));
      console.log("Values to fill:", values);
      
      if (pdfFields.length === 0) {
        console.log("WARNING: No form fields found in PDF! This PDF may be a flat form (scanned or filled manually).");
      }
      
      // Build mapping: our field_name -> pdf_field_mapping (or field_name as fallback)
      const fieldMappings = new Map<string, string>();
      for (const field of fields) {
        const pdfFieldName = field.pdf_field_mapping || field.field_name;
        fieldMappings.set(field.field_name, pdfFieldName);
      }

      // Also build a reverse lookup of all PDF field names (lowercase) for fuzzy matching
      const pdfFieldNameMap = new Map<string, string>();
      for (const pf of pdfFields) {
        pdfFieldNameMap.set(pf.getName().toLowerCase().trim(), pf.getName());
      }

      let filledCount = 0;
      for (const [formFieldName, value] of Object.entries(values)) {
        if (!value || !value.toString().trim()) continue;
        
        const mappedName = fieldMappings.get(formFieldName);
        if (!mappedName) continue;

        // Try exact match first, then case-insensitive
        let actualPdfFieldName = mappedName;
        if (!pdfFieldNameMap.has(mappedName) && !pdfFieldNameMap.has(mappedName.toLowerCase())) {
          // Try fuzzy: look for partial match
          const lower = mappedName.toLowerCase().trim();
          let found = false;
          for (const [key, realName] of pdfFieldNameMap) {
            if (key.includes(lower) || lower.includes(key)) {
              actualPdfFieldName = realName;
              found = true;
              break;
            }
          }
          if (!found) {
            console.log(`Field "${formFieldName}" (mapped to "${mappedName}") - NO MATCH in PDF`);
            continue;
          }
        } else {
          actualPdfFieldName = pdfFieldNameMap.get(mappedName.toLowerCase().trim()) || mappedName;
        }

        console.log(`Filling field: "${actualPdfFieldName}" with value: "${value}"`);
        try {
          const pdfField = pdfForm.getField(actualPdfFieldName);
          const fieldType = pdfField.constructor.name;
          console.log(`  Field type: ${fieldType}`);
          
          if (fieldType === "PDFTextField") {
            (pdfField as any).setText(value.toString());
            filledCount++;
          } else if (fieldType === "PDFCheckBox") {
            if (value === true || value === "true" || value === "yes") {
              (pdfField as any).check();
              filledCount++;
            } else {
              (pdfField as any).uncheck();
            }
          } else if (fieldType === "PDFDropdown") {
            try {
              (pdfField as any).select(value.toString());
              filledCount++;
            } catch (e) {
              console.log(`  Dropdown select failed:`, e);
            }
          } else if (fieldType === "PDFRadioGroup") {
            try {
              (pdfField as any).select(value.toString());
              filledCount++;
            } catch (e) {
              console.log(`  Radio select failed:`, e);
            }
          }
        } catch (e) {
          console.log(`  Error filling field:`, e);
        }
      }

      console.log(`Filled ${filledCount} fields`);

      const filledBytes = await pdfDoc.save();
      const blob = new Blob([filledBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      
      // Revoke old URL to prevent memory leaks
      if (filledPdfUrl && filledPdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filledPdfUrl);
      }
      
      const newUrl = URL.createObjectURL(blob);
      setFilledPdfUrl(newUrl);
    } catch (err) {
      console.error("Error filling PDF:", err);
    } finally {
      setIsFillingPdf(false);
    }
  }, [fields, filledPdfUrl]);

  // Debounce PDF filling on value changes
  useEffect(() => {
    if (!pdfBytesRef.current) return;
    
    // Check if any values are non-empty
    const hasValues = Object.values(watchedValues).some(v => v && v.toString().trim());
    if (!hasValues) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fillPdfWithValues(watchedValues);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watchedValues, fillPdfWithValues]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (filledPdfUrl && filledPdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filledPdfUrl);
      }
    };
  }, []);

  const handleDownloadFilledPdf = () => {
    if (!filledPdfUrl) return;
    const a = window.document.createElement("a");
    a.href = filledPdfUrl;
    a.download = `${document.form_name || document.official_name} - Filled.pdf`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleAutoFillFromAI = async () => {
    if (fields.length === 0) return;
    if (!document.official_pdf_url) {
      setAutoFillError("No PDF available for this document");
      return;
    }
    
    setIsAutoFilling(true);
    setAutoFillError(null);
    try {
      // Client-side fuzzy matching first
      const fuzzyMatch = (formName: string, pdfName: string): boolean => {
        const f = formName.toLowerCase().replace(/_/g, '').replace(/ /g, '');
        const p = pdfName.toLowerCase().replace(/_/g, '').replace(/ /g, '');
        return f === p || f.includes(p) || p.includes(f) || 
              Levenshtein(f, p) < 3;
      };
      
      const Levenshtein = (a: string, b: string): number => {
        const matrix: number[][] = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
          }
        }
        return matrix[b.length][a.length];
      };

      const clientMappings: Record<string, string> = {};
      for (const field of fields) {
        for (const pdfField of pdfFieldsDebug) {
          if (fuzzyMatch(field.field_name, pdfField)) {
            clientMappings[field.field_name] = pdfField;
            break;
          }
        }
      }

      console.log("Client fuzzy mappings:", clientMappings);

      // If we have good mappings, use them directly
      if (Object.keys(clientMappings).length > 0) {
        const currentValues = form.getValues();
        const mappedValues: Record<string, any> = {};
        
        for (const [formFieldName, value] of Object.entries(currentValues)) {
          if (value && value.toString().trim()) {
            const pdfFieldName = clientMappings[formFieldName] || formFieldName;
            mappedValues[pdfFieldName] = value;
          }
        }
        
        fillPdfWithValues(mappedValues);
        setIsAutoFilling(false);
        return;
      }

      // Fallback to AI mapping
      const { supabase } = await import('@/integrations/supabase/client');
      
      const fieldInfo = fields.map(f => ({
        name: f.field_name,
        label: f.field_label,
        type: f.field_type,
        required: f.required,
      }));

      const { data, error } = await supabase.functions.invoke('pdf-form-analyze', {
        body: {
          fields: fieldInfo,
          pdf_field_names: pdfFieldsDebug,
        }
      });

      console.log("AI Response:", data);
      if (error) {
        console.error("Edge function error:", error);
        setAutoFillError("AI service unavailable. Please fill fields manually.");
        setIsAutoFilling(false);
        return;
      }
      
      if (data?.error) {
        setAutoFillError(data.error);
        setIsAutoFilling(false);
        return;
      }

      // Apply AI field mappings and fill PDF
      if (data?.field_mappings && Object.keys(data.field_mappings).length > 0) {
        const mappings = data.field_mappings;
        const currentValues = form.getValues();
        const mappedValues: Record<string, any> = {};
        
        for (const [formFieldName, value] of Object.entries(currentValues)) {
          if (value && value.toString().trim()) {
            const pdfFieldName = mappings[formFieldName] || formFieldName;
            mappedValues[pdfFieldName] = value;
          }
        }
        
        fillPdfWithValues(mappedValues);
      } else {
        setAutoFillError("Could not map fields. Please fill manually.");
      }
    } catch (err) {
      console.error("Auto-fill error:", err);
      setAutoFillError("Failed to create document. Please try again.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const renderFieldInput = (field: LibraryField) => {
    const errorMessage = form.formState.errors[field.field_name]?.message as string | undefined;
    const label = (
      <label className="text-sm font-medium">
        {field.field_label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
    );

    if (field.field_type === "checkbox") {
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.field_name}
            checked={!!watchedValues[field.field_name]}
            onCheckedChange={(checked) => form.setValue(field.field_name, checked)}
          />
          <label htmlFor={field.field_name} className="text-sm font-medium">
            {field.field_label}
          </label>
        </div>
      );
    }

    if (field.field_type === "textarea") {
      return (
        <div className="space-y-2 md:col-span-2">
          {label}
          <Textarea
            {...form.register(field.field_name)}
            placeholder={field.field_label}
            rows={3}
          />
          {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
        </div>
      );
    }

    if (field.field_type === "select") {
      return (
        <div className="space-y-2">
          {label}
          <Select
            value={watchedValues[field.field_name] as string || ""}
            onValueChange={(value) => form.setValue(field.field_name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.field_label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
          {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
        </div>
      );
    }

    const inputType = field.field_type === "number" ? "number" 
      : field.field_type === "date" ? "date"
      : field.field_type === "email" ? "email"
      : field.field_type === "tel" ? "tel"
      : "text";

    return (
      <div className="space-y-2">
        {label}
        <Input
          type={inputType}
          {...form.register(field.field_name)}
          placeholder={inputType === "email" ? "email@example.com" 
            : inputType === "tel" ? "+1 234 567 8900" 
            : field.field_label}
        />
        {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
      </div>
    );
  };

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FilePlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Form Fields Available</h3>
          <p className="text-muted-foreground">
            This document doesn't have any configurable fields yet.
            {document.official_pdf_url && (
              <a 
                href={document.official_pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Download the official PDF
              </a>
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card>
          <CardHeader>
            <CardTitle>Fill Form Details</CardTitle>
            <CardDescription>
              Enter the required information for {document.form_name || document.official_name}. 
              The official PDF updates live as you type.
            </CardDescription>
            {pdfFieldsDebug.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>PDF Fields detected:</strong> {pdfFieldsDebug.join(", ")}
              </div>
            )}
            {pdfFieldsDebug.length === 0 && document.official_pdf_url && (
              <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ This PDF doesn't have fillable form fields. It may be a scanned document.
              </div>
            )}
            {pdfFieldsDebug.length > 0 && fields.length > 0 && (
              <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-medium">Debug Info:</div>
                <div>Form fields: {fields.map(f => f.field_name).join(", ")}</div>
                <div>PDF fields: {pdfFieldsDebug.join(", ")}</div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.id} className={field.field_type === "textarea" ? "md:col-span-2" : ""}>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>

              {autoFillError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {autoFillError}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              onClick={handleAutoFillFromAI}
              disabled={isAutoFilling}
              variant="secondary"
              className="flex-1"
            >
              {isAutoFilling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Document...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create Document
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Right: Official PDF Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Official PDF</CardTitle>
                <CardDescription>
                  {isFillingPdf ? 'Updating PDF with your data...' : 'Your inputs are filled into the official form'}
                </CardDescription>
              </div>
              {isFillingPdf && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
          </CardHeader>
          <CardContent>
            {pdfLoadError && !filledPdfUrl && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {pdfLoadError}
              </div>
            )}
            {filledPdfUrl ? (
              <iframe
                key={filledPdfUrl}
                src={filledPdfUrl}
                className="w-full h-[700px] border rounded-lg"
                title="Filled PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-[700px] border rounded-lg bg-muted/30">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading official PDF...</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button 
              onClick={handleDownloadFilledPdf} 
              disabled={!filledPdfUrl}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Filled PDF
            </Button>
            {document.official_pdf_url && (
              <Button variant="outline" asChild>
                <a href={document.official_pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileDown className="w-4 h-4 mr-2" />
                  Original PDF
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LibraryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useLibraryDocument(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr" className="h-10" />
              <span className="font-semibold text-lg">Certifyr</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-center">
            <Link to="/">
              <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr" className="h-10" />
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Document Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The requested document could not be found.
              </p>
              <Button asChild>
                <Link to="/library">Back to Library</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { document, tags, fields, dependencies, attachments } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-center">
          <Link to="/">
            <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr" className="h-10" />
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/library">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Link>
            </Button>
          </div>
        </div>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details" className="gap-2">
              <FileText className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="form" className="gap-2">
              <FilePlus className="w-4 h-4" />
              Form
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{COUNTRY_FLAGS[document.country] || "🌐"}</span>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{document.form_name || document.official_name}</CardTitle>
                    {document.form_name && document.official_name !== document.form_name && (
                      <p className="text-sm text-muted-foreground mt-1">{document.official_name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-sm">
                        <Globe className="w-3 h-3 mr-1" />
                        {document.country}
                      </Badge>
                      {document.state && (
                        <Badge variant="outline" className="text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {document.state}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-sm">
                        <Building2 className="w-3 h-3 mr-1" />
                        {document.authority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Version: {document.version}
              </span>
              {document.last_verified_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Verified: {new Date(document.last_verified_at).toLocaleDateString()}
                </span>
              )}
              {document.needs_review && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs Review
                </Badge>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> Certifyr does not provide legal advice. Always verify 
                  information with the official authority before proceeding.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {document.full_description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.full_description}</p>
            </CardContent>
          </Card>
        )}

        {document.purpose && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.purpose}</p>
            </CardContent>
          </Card>
        )}

        {document.who_must_file && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Who Must File</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.who_must_file}</p>
            </CardContent>
          </Card>
        )}

        {document.filing_method && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filing Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{document.filing_method}</p>
            </CardContent>
          </Card>
        )}

        <DependenciesSection dependencies={dependencies} />
        <AttachmentsSection attachments={attachments} />
        <FieldsTable fields={fields} />

        {(document.official_source_url || document.official_pdf_url) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.official_source_url && (
                <a
                  href={document.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Official Source</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {document.official_source_url}
                    </div>
                  </div>
                </a>
              )}
              {document.official_pdf_url && (
                <a
                  href={document.official_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <FileDown className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Official PDF Form</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {document.official_pdf_url}
                    </div>
                  </div>
                </a>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Links open in a new tab. Always verify you're on the official government website.
              </p>
            </CardFooter>
          </Card>
        )}

        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <LibraryFormTab 
            document={document} 
            fields={fields} 
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
