import { useState } from "react";
import { useEmployeePortal } from "@/contexts/EmployeePortalContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowRight } from "lucide-react";
import { popularTemplates } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Copy the additionalTemplates and aggregation logic from admin dashboard
const additionalTemplates = [
  {
    id: "embassy-attestation-1",
    title: "Embassy Attestation Letter",
    description: "Letter for document attestation at embassies",
    category: "Travel",
    usageCount: 31,
  },
  {
    id: "completion-certificate-1",
    title: "Completion Certificate",
    description: "Certificate for courses, training programs, internships",
    category: "Educational",
    usageCount: 28,
  },
  {
    id: "transfer-certificate-1",
    title: "Transfer Certificate",
    description: "Certificate for students moving between institutions",
    category: "Educational",
    usageCount: 25,
  },
  {
    id: "income-certificate-1",
    title: "Income Certificate",
    description: "Certificate stating employee income details",
    category: "Employment",
    usageCount: 23,
  },
  {
    id: "maternity-leave-1",
    title: "Maternity Leave Application",
    description: "Application for maternity leave benefits",
    category: "Employment",
    usageCount: 22,
  },
  {
    id: "bank-verification-1",
    title: "Bank Account Verification",
    description: "Letter confirming account details for banks",
    category: "Financial",
    usageCount: 19,
  },
  {
    id: "offer-letter-1",
    title: "Offer Letter",
    description: "Formal job offer letter to candidates",
    category: "Employment",
    usageCount: 18,
  },
  {
    id: "address-proof-1",
    title: "Address Proof Certificate",
    description: "Certificate verifying residential address",
    category: "Legal",
    usageCount: 0,
  },
  {
    id: "articles-incorporation-1",
    title: "Articles of Incorporation",
    description: "Certificate of Incorporation for new corporations",
    category: "Corporate",
    usageCount: 15,
  },
  {
    id: "corporate-bylaws-1",
    title: "Corporate Bylaws",
    description: "Corporate governance and operating procedures",
    category: "Corporate",
    usageCount: 12,
  },
  {
    id: "founders-agreement-1",
    title: "Founders' Agreement",
    description: "Agreement between company founders",
    category: "Corporate",
    usageCount: 10,
  },
  {
    id: "stock-purchase-agreement-1",
    title: "Stock Purchase Agreement",
    description: "Agreement for purchasing company shares",
    category: "Corporate",
    usageCount: 8,
  },
  {
    id: "employment-agreement-1",
    title: "Employment Agreement",
    description: "Comprehensive employment contract",
    category: "Corporate",
    usageCount: 14,
  },
  {
    id: "nda-1",
    title: "Non-Disclosure Agreement (NDA)",
    description: "Confidentiality agreement between parties",
    category: "Corporate",
    usageCount: 16,
  },
  {
    id: "academic-transcript-1",
    title: "Academic Transcript / Marksheet",
    description: "Official academic record and transcript",
    category: "Academic",
    usageCount: 35,
  },
];

function getUniqueTemplates(templates) {
  const seen = new Set();
  return templates.filter((tpl) => {
    if (seen.has(tpl.id)) return false;
    seen.add(tpl.id);
    return true;
  });
}

const existingPopularIds = new Set(popularTemplates.map((t) => t.id));
const dedupedAdditionalTemplates = additionalTemplates.filter(
  (tpl) => !existingPopularIds.has(tpl.id),
);
const allTemplatesArr = [...popularTemplates, ...dedupedAdditionalTemplates];
const uniqueTemplates = getUniqueTemplates(allTemplatesArr);

export function EmployeeTemplates() {
  const { employee, organizationId } = useEmployeePortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  // Filter templates based on search and category filters
  const filteredTemplates = uniqueTemplates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(template.category);
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
    new Set(uniqueTemplates.map((t) => t.category)),
  );

  const requestDocument = async (templateId: string) => {
    try {
      // This would normally show a form to fill template data
      // For now, we'll just create a basic request
      if (!employee || !organizationId) return;
      // Insert notification for admin
      await supabase.from("announcements").insert({
        title: `${employee.full_name} Requested Document Approval`,
        content: `${employee.full_name} requested approval for the following document: ${uniqueTemplates.find((t) => t.id === templateId)?.title || templateId}.\n\nCheck details and respond in Request Portal → Requests.`,
        organization_id: organizationId,
        created_by: employee.id,
        is_active: true,
        is_global: false,
      });
      toast({
        title: "Request Submitted",
        description: "Your document request has been submitted for approval",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Available Documents</h1>
          <p className="text-muted-foreground">
            Browse and request documents from our collection.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" size="icon" className="md:hidden">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="ml-auto md:ml-0"
        >
          Clear Filters
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={
              selectedCategories.includes(category) ? "default" : "outline"
            }
            className="cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="glass-card p-5 flex flex-col">
            <div className="mb-4 flex items-start justify-end">
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            </div>
            <h3 className="font-medium text-lg mb-1">{template.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {template.description}
            </p>
            <div className="mt-auto flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                className="ml-auto flex items-center gap-1"
                onClick={() =>
                  navigate(
                    `/${organizationId}/request-portal/documents/${template.id}`,
                  )
                }
              >
                Use <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
