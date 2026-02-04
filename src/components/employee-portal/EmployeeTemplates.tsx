import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeePortal } from "@/contexts/EmployeePortalContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, FileText, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { documentConfigs, getDocumentConfig } from "@/config/documentConfigs";
import { Skeleton } from "@/components/ui/skeleton";

// Document metadata for UI display - mirrors admin-side NewDocuments.tsx
const documentMetadata = [
  { id: "bonafide-1", configKey: "bonafide", category: "Academic" },
  { id: "character-1", configKey: "character", category: "Academic" },
  { id: "experience-1", configKey: "experience", category: "Employment" },
  { id: "transfer-1", configKey: "transfer", category: "Academic" },
  { id: "academic-transcript-1", configKey: "academic-transcript", category: "Academic" },
  { id: "completion-1", configKey: "completion", category: "Academic" },
  { id: "income-1", configKey: "income", category: "Employment" },
  { id: "maternity-leave-1", configKey: "maternity-leave", category: "Employment" },
  { id: "offer-letter-1", configKey: "offer-letter", category: "Employment" },
  { id: "noc-visa-1", configKey: "noc-visa", category: "Travel" },
  { id: "bank-verification-1", configKey: "bank-verification", category: "Financial" },
  { id: "address-proof-1", configKey: "address-proof", category: "Legal" },
  { id: "nda-1", configKey: "nda", category: "Corporate" },
  { id: "employment-agreement-1", configKey: "employment-agreement", category: "Corporate" },
  { id: "articles-incorporation-1", configKey: "articles-incorporation", category: "Corporate" },
  { id: "corporate-bylaws-1", configKey: "corporate-bylaws", category: "Corporate" },
  { id: "founders-agreement-1", configKey: "founders-agreement", category: "Corporate" },
  { id: "stock-purchase-agreement-1", configKey: "stock-purchase-agreement", category: "Corporate" },
  { id: "embassy-attestation-1", configKey: "embassy-attestation", category: "Travel" },
  { id: "embassy-attestation-letter-1", configKey: "embassy-attestation-letter", category: "Travel" },
];

export function EmployeeTemplates() {
  const { organizationId } = useEmployeePortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [portalSlug, setPortalSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch portal slug
  useEffect(() => {
    const fetchPortalSlug = async () => {
      if (!organizationId) return;

      try {
        const { data } = await supabase
          .from("organizations")
          .select("portal_slug")
          .eq("id", organizationId)
          .maybeSingle();

        if (data?.portal_slug) {
          setPortalSlug(data.portal_slug);
        }
      } catch (error) {
        console.error("Error fetching portal slug:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalSlug();
  }, [organizationId]);

  // Get unique categories
  const categories = Array.from(new Set(documentMetadata.map((doc) => doc.category)));

  // Filter documents based on search and category
  const filteredDocuments = documentMetadata.filter((docMeta) => {
    const config = documentConfigs[docMeta.configKey];
    if (!config) return false;

    const matchesSearch =
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(docMeta.category);

    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Documents</h1>
          <p className="text-muted-foreground">
            Browse and request documents from our collection.
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {selectedCategories.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters}>Clear filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selected filters */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="hover:bg-muted rounded-full ml-1 h-4 w-4 flex items-center justify-center"
              >
                <span className="sr-only">Remove</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Document Cards */}
      <div className="glass-card p-5">
        {filteredDocuments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((docMeta) => {
              const config = documentConfigs[docMeta.configKey];
              if (!config) return null;

              return (
                <div key={docMeta.id} className="glass-card p-5 flex flex-col">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {docMeta.category}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-lg mb-1">{config.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {config.description || config.name}
                  </p>
                  <div className="mt-auto flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate(`/portal/${portalSlug}/documents/${docMeta.id}`)}
                    >
                      Use <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
