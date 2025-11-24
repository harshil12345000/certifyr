import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { TemplatesSkeleton } from "@/components/dashboard/TemplatesSkeleton";
import { documentConfigs } from "@/config/documentConfigs";

// Document metadata for UI display
const documentMetadata = [
  { id: "bonafide-1", configKey: "bonafide", category: "Academic", usageCount: 45 },
  { id: "character-1", configKey: "character", category: "Academic", usageCount: 42 },
  { id: "experience-1", configKey: "experience", category: "Employment", usageCount: 38 },
  { id: "transfer-1", configKey: "transfer", category: "Academic", usageCount: 25 },
  { id: "academic-transcript-1", configKey: "academic-transcript", category: "Academic", usageCount: 35 },
  { id: "completion-1", configKey: "completion", category: "Academic", usageCount: 28 },
  { id: "income-1", configKey: "income", category: "Employment", usageCount: 23 },
  { id: "maternity-leave-1", configKey: "maternity-leave", category: "Employment", usageCount: 22 },
  { id: "offer-letter-1", configKey: "offer-letter", category: "Employment", usageCount: 18 },
  { id: "noc-visa-1", configKey: "noc-visa", category: "Travel", usageCount: 20 },
  { id: "bank-verification-1", configKey: "bank-verification", category: "Financial", usageCount: 19 },
  { id: "address-proof-1", configKey: "address-proof", category: "Legal", usageCount: 17 },
  { id: "nda-1", configKey: "nda", category: "Corporate", usageCount: 16 },
  { id: "employment-agreement-1", configKey: "employment-agreement", category: "Corporate", usageCount: 14 },
  { id: "articles-incorporation-1", configKey: "articles-incorporation", category: "Corporate", usageCount: 15 },
  { id: "corporate-bylaws-1", configKey: "corporate-bylaws", category: "Corporate", usageCount: 12 },
  { id: "founders-agreement-1", configKey: "founders-agreement", category: "Corporate", usageCount: 10 },
  { id: "stock-purchase-agreement-1", configKey: "stock-purchase-agreement", category: "Corporate", usageCount: 8 },
  { id: "embassy-attestation-1", configKey: "embassy-attestation", category: "Travel", usageCount: 31 },
  { id: "embassy-attestation-letter-1", configKey: "embassy-attestation-letter", category: "Travel", usageCount: 26 },
];

const NewDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get unique categories
  const categories = Array.from(new Set(documentMetadata.map((doc) => doc.category)));

  // Filter documents
  const filteredDocuments = documentMetadata.filter((docMeta) => {
    const config = documentConfigs[docMeta.configKey];
    if (!config) return false;

    const matchesSearch =
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(docMeta.category);
    
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/document-builder/${documentId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <TemplatesSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Documents</h1>
            <p className="text-muted-foreground">
              Configuration-driven document system - streamlined and scalable
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
                <DropdownMenuItem onClick={clearFilters}>
                  Clear filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selected filters */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1"
              >
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
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs"
            >
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
                  <Card
                    key={docMeta.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                    onClick={() => handleDocumentClick(docMeta.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <FileText className="h-8 w-8 text-primary" />
                        <Badge variant="outline">{docMeta.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {config.sections.length} sections, {config.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {docMeta.usageCount} uses
                          </Badge>
                          <span className="capitalize">{config.layoutType}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories Overview */}
        <h2 className="text-lg font-medium mt-8 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => {
            const count = documentMetadata.filter((d) => d.category === category).length;
            return (
              <div
                key={category}
                className="glass-card p-5 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedCategories([category]);
                  setSearchQuery("");
                }}
              >
                <div className="mb-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20">
                    {count} Documents
                  </Badge>
                </div>
                <h3 className="font-medium text-lg mb-1">{category}</h3>
                <Button
                  variant="ghost"
                  className="justify-start p-0 hover:bg-transparent hover:text-primary mt-auto"
                  size="sm"
                >
                  View category <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewDocuments;
