import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TemplateCard } from "@/components/dashboard/TemplateCard";
import { documentCategories } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, ChevronRight } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { popularTemplates } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { TemplatesSkeleton } from "@/components/dashboard/TemplatesSkeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { UpgradePrompt } from "@/components/shared/UpgradePrompt";

// Define a minimal Template type to maintain correct typings
type Template = {
  id: string;
  title: string;
  description: string;
  category: string;
};
function getUniqueTemplates(templates: Template[]): Template[] {
  const seen = new Set<string>();
  return templates.filter((tpl) => {
    if (seen.has(tpl.id)) return false;
    seen.add(tpl.id);
    return true;
  });
}

// The actual templates for uniqueness
const additionalTemplates: Template[] = [
  {
    id: "embassy-attestation-1",
    title: "Embassy Attestation Letter",
    description: "Letter for document attestation at embassies",
    category: "Travel",
  },
  {
    id: "completion-certificate-1",
    title: "Completion Certificate",
    description: "Certificate for courses, training programs, internships",
    category: "Educational",
  },
  {
    id: "transfer-certificate-1",
    title: "Transfer Certificate",
    description: "Certificate for students moving between institutions",
    category: "Educational",
  },
  {
    id: "income-certificate-1",
    title: "Income Certificate",
    description: "Certificate stating employee income details",
    category: "Employment",
  },
  {
    id: "maternity-leave-1",
    title: "Maternity Leave Application",
    description: "Application for maternity leave benefits",
    category: "Employment",
  },
  {
    id: "bank-verification-1",
    title: "Bank Account Verification",
    description: "Letter confirming account details for banks",
    category: "Financial",
  },
  {
    id: "offer-letter-1",
    title: "Offer Letter",
    description: "Formal job offer letter to candidates",
    category: "Employment",
  },
  {
    id: "address-proof-1",
    title: "Address Proof Certificate",
    description: "Certificate verifying residential address",
    category: "Legal",
  },
  {
    id: "articles-incorporation-1",
    title: "Articles of Incorporation",
    description: "Certificate of Incorporation for new corporations",
    category: "Corporate",
  },
  {
    id: "corporate-bylaws-1",
    title: "Corporate Bylaws",
    description: "Corporate governance and operating procedures",
    category: "Corporate",
  },
  {
    id: "founders-agreement-1",
    title: "Founders' Agreement",
    description: "Agreement between company founders",
    category: "Corporate",
  },
  {
    id: "stock-purchase-agreement-1",
    title: "Stock Purchase Agreement",
    description: "Agreement for purchasing company shares",
    category: "Corporate",
  },
  {
    id: "employment-agreement-1",
    title: "Employment Agreement",
    description: "Comprehensive employment contract",
    category: "Corporate",
  },
  {
    id: "nda-1",
    title: "Non-Disclosure Agreement (NDA)",
    description: "Confidentiality agreement between parties",
    category: "Corporate",
  },
  {
    id: "academic-transcript-1",
    title: "Academic Transcript / Marksheet",
    description: "Official academic record and transcript",
    category: "Academic",
  },
];

// Construct unique templates array:
const existingPopularIds = new Set(popularTemplates.map((t) => t.id));
const dedupedAdditionalTemplates = additionalTemplates.filter(
  (tpl) => !existingPopularIds.has(tpl.id),
);
const allTemplatesArr: Template[] = [
  ...popularTemplates,
  ...dedupedAdditionalTemplates,
];
export const uniqueDocuments: Template[] = getUniqueTemplates(allTemplatesArr);
// Legacy export for backward compatibility
export const uniqueTemplates: Template[] = uniqueDocuments;
const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [showUpgradePaywall, setShowUpgradePaywall] = useState(false);
  // TODO: Replace with real admin check
  const isAdmin = true;

  // Check document limit on mount for Basic users
  useEffect(() => {
    const checkDocumentLimit = async () => {
      if (!user?.id) return;
      
      // Check if user is on Basic plan
      const isBasicPlan = subscription?.active_plan === 'basic';
      
      if (isBasicPlan && user.id) {
        const { data: limitData } = await supabase.rpc('check_document_limit', { p_user_id: user.id });
        
        // Show upgrade popup if limit reached OR if they've already used 25+ docs
        if (limitData && (!limitData.allowed || limitData.used >= 25)) {
          setShowUpgradePaywall(true);
        }
      }
    };
    
    // Run check after a short delay to ensure subscription is loaded
    if (subscription !== undefined) {
      const timer = setTimeout(checkDocumentLimit, 100);
      return () => clearTimeout(timer);
    }
  }, [subscription, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Simulate loading for 500ms
    return () => clearTimeout(timer);
  }, []);

  // Filter documents based on search and category filters
  const filteredDocuments = uniqueDocuments.filter((document) => {
    const matchesSearch =
      document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(document.category);
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
  const categories: string[] = Array.from(
    new Set(uniqueDocuments.map((t) => t.category)),
  );
  const handleCreateTemplate = () => {
    navigate("/template-builder");
  };

  // Function to handle category card clicks
  const handleCategoryClick = (categoryName: string) => {
    // Map display names to actual category names used in templates
    const categoryMapping: {
      [key: string]: string;
    } = {
      "Student Documents": "Academic",
      "Employment Records": "Employment",
      "Official Certificates": "General",
      "Financial Documents": "Financial",
      "Travel & Visa": "Travel",
      Corporate: "Corporate",
      Legal: "Legal",
      Miscellaneous: "Legal",
    };
    const actualCategory = categoryMapping[categoryName] || categoryName;
    setSelectedCategories([actualCategory]);
    setSearchQuery("");
  };

  // Calculate real template counts for each category
  const getCategoryCount = (categoryName: string) => {
    const categoryMapping: {
      [key: string]: string;
    } = {
      "Student Documents": "Academic",
      "Employment Records": "Employment",
      "Official Certificates": "General",
      "Financial Documents": "Financial",
      "Travel & Visa": "Travel",
      Corporate: "Corporate",
      Legal: "Legal",
      Miscellaneous: "Legal",
    };
    const actualCategory = categoryMapping[categoryName] || categoryName;
    return uniqueDocuments.filter(
      (document) => document.category === actualCategory,
    ).length;
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
              Browse and use our collection of legally reliable documents.
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

        {/* Template Content */}
        <div className="glass-card p-5">
          {/* Selected filters */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((category) => (
                <Badge
                  key={String(category)}
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
              {filteredDocuments.map((document) => (
                <TemplateCard
                  key={document.id}
                  id={document.id}
                  title={document.title}
                  description={document.description}
                  category={document.category}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Template Categories */}
        <h2 className="text-lg font-medium mt-8 mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documentCategories.map((category) => {
            const Icon = category.icon;
            const realCount = getCategoryCount(category.name);
            return (
              <div
                key={category.id}
                className="glass-card p-5 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="mb-2">
                  <Badge
                    variant="outline"
                    className="bg-primary-50 border-primary-200 text-primary-700"
                  >
                    {realCount} Documents
                  </Badge>
                </div>
                <h3 className="font-medium text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {category.description}
                </p>
                <Button
                  variant="ghost"
                  className="justify-start p-0 hover:bg-transparent hover:text-primary-600"
                  size="sm"
                >
                  View category <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <UpgradePrompt 
        requiredPlan="pro" 
        variant="force"
        open={showUpgradePaywall}
        onOpenChange={setShowUpgradePaywall}
      />
    </DashboardLayout>
  );
};
export default Documents;
